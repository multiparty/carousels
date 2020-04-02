const carouselsTypes = require('../symbols/types.js');
const Parameter = require('../symbols/parameter.js');
const math = require('../math.js');

const ModifiedVisitor = require('../helpers/modified.js');
const ListVisitor = require('../helpers/list.js');

// finding side effects
const getModifiedVariables = function (node) {
  // Obliv if may have several side effects, traditionally, it costs a multiplication per side effect
  // variables changed in either or both branches count as a single side effect.
  const modifiedVisitor = new ModifiedVisitor(this.analyzer);
  modifiedVisitor.start(node.ifBody);
  const modifiedMap = modifiedVisitor.undefinedModifiedVariables;
  const elseModified = modifiedVisitor.start(node.elseBody);
  for (let i = 0; i < elseModified.length; i++) {
    modifiedMap[elseModified[i]] = true;
  }

  const modifiedVariables = [];
  for (let key in modifiedMap) {
    if (Object.prototype.hasOwnProperty.call(modifiedMap, key)) {
      if (modifiedMap[key]) {
        modifiedVariables.push(key);
      }
    }
  }

  return modifiedVariables;
};

// interaction with metric and types in scope
const getFromScope = function (variables, which) {
  const scopedMap = which === 'metric' ? this.analyzer.variableMetricMap : this.analyzer.variableTypeMap;
  const values = {};
  for (let i = 0; i < variables.length; i++) {
    const varName = variables[i];
    values[varName] = scopedMap.get(varName);
  }
  return values;
};
const setInScope = function (map, which) {
  const scopedMap = which === 'metric' ? this.analyzer.variableMetricMap : this.analyzer.variableTypeMap;
  for (let key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      scopedMap.set(key, map[key]);
    }
  }
};

// combining types of side-effects / return value from both branches
const combineTypes = function (ifType, elseType, conditionMathEquation, pathStr) {
  // sanity checks
  if (ifType.is(carouselsTypes.ARRAY) || ifType.is(carouselsTypes.RANGE)) {
    throw new Error('OblivIf "' + pathStr + '" in ifBody has illegal type "' + ifType.dataType + '"!')
  }
  if (elseType.is(carouselsTypes.ARRAY) || elseType.is(carouselsTypes.RANGE)) {
    throw new Error('OblivIf "' + pathStr + '" in elseBody has illegal type "' + ifType.dataType + '"!')
  }
  if (ifType.dataType !== elseType.dataType) {
    throw new Error('OblivIf "' + pathStr + '" in ifBody and elseBody produce different types "' + ifType.dataType + '" and "' + elseType.dataType + '"!')
  }

  const type = ifType.combine(elseType, conditionMathEquation);
  type.secret = true; // whatever was given to oblivIf does not matter, return is always secret
  return type;
};
const combineMetrics = function (node, ifResult, elseResult, conditionResult, sideEffects, pathStr) {
  // aggregate children metric
  const childrenType = {
    condition: conditionResult.type,
    ifBody: ifResult.type,
    elseBody: elseResult.type
  };
  const childrenMetric = {
    condition: conditionResult.metric,
    ifBody: ifResult.metric,
    elseBody: elseResult.metric,
    sideEffects: sideEffects
  };
  const aggregateMetric = this.analyzer.metric.aggregateOblivIf(node, childrenType, childrenMetric);

  // find cost in rules and apply it
  const typeString = conditionResult.type.toString() + '?' + ifResult.type.toString() + ':' + elseResult.type.toString();
  const finalMetric = this.analyzer.costs.applyMatch(node, typeString, pathStr, aggregateMetric, childrenType, childrenMetric);

  // done
  return finalMetric;
};

// Used for both If and OblivIf
const OblivIf = function (node, pathStr) {
  // condition is assumed not to have assignments for now
  const listVisitor = new ListVisitor();
  if (listVisitor.has(node.condition, 'variableAssignment')) {
    throw new Error('OblivIf condition cannot have assignments or side effects!');
  }

  const condition = node.condition;
  const ifBody = node.ifBody;
  const elseBody = node.elseBody;

  // handling side effects
  const sideEffects = getModifiedVariables.call(this, node);
  const oldTypes = getFromScope.call(this, sideEffects, 'type');
  const oldMetrics = getFromScope.call(this, sideEffects, 'metric');

  // visit children
  const conditionResult = this.visit(condition, pathStr + 'oblivIf[condition]');

  this.analyzer.addScope();
  const ifResult = this.visit(ifBody, pathStr + 'oblivIf[body]');
  this.analyzer.removeScope();
  const ifTypes = getFromScope.call(this, sideEffects, 'type');
  const ifMetrics = getFromScope.call(this, sideEffects, 'metric');

  // undo effects of if body
  setInScope.call(this, oldTypes, 'type');
  setInScope.call(this, oldMetrics, 'metric');

  this.analyzer.addScope();
  const elseResult = this.visit(elseBody, pathStr + 'oblivElse[body]');
  this.analyzer.removeScope();
  const elseTypes = getFromScope.call(this, sideEffects, 'type');
  const elseMetrics = getFromScope.call(this, sideEffects, 'metric');

  // make sure we have an else branch
  if (elseResult == null) {
    throw new Error('Expected else for OblivIf "' + pathStr + '"!');
  }

  // turn the condition type into something actionable: a mathjs expression
  // that can be used in a symbolic if statement
  let conditionMathEquation;
  if (conditionResult.type.is(carouselsTypes.ENUM.BOOL)) {
    conditionMathEquation = conditionResult.type.dependentType.value;
  } else if (conditionResult.type.is(carouselsTypes.ENUM.NUMBER)) {
    conditionMathEquation = math.neq(conditionResult.type.dependentType.value, math.parse('0'));
  } else {
    const parameter = Parameter.forCondition(pathStr + 'oblivIf[condition]');
    this.analyzer.addParameters([parameter]);
    conditionMathEquation = parameter.mathSymbol;
  }

  // handle side effects
  const sideEffectMetrics = [];
  for (let i = 0; i < sideEffects.length; i++) {
    const varName = sideEffects[i];

    // side effects may only apply to secret variables
    if (!oldTypes[varName].secret) {
      throw new Error('Obliv If "' + pathStr + '" modifies non-secret variable "' + varName + '"!');
    }

    // construct children mapping for side effect
    const ifBranch = {
      type: ifTypes[varName],
      metric: ifMetrics[varName]
    };
    const elseBranch = {
      type: elseTypes[varName],
      metric: elseMetrics[varName]
    };
    const conditionCase = {
      type: conditionResult.type,
      metric: this.analyzer.metric.store(conditionResult.metric) // it is as if the condition is stored in a variable and then used many times
    };

    // combine types T1, T2 into combine iff(condition, T1, T2)
    const combinedType = combineTypes(ifTypes[varName], elseTypes[varName], conditionMathEquation, pathStr + varName);
    // combine metrics c, m1, m2 into cost(oblivif, aggregate(c, m1, m2))
    // e.g. for rounds this is: max(c, m1, m2) + 1
    // e.g. for total communication this is: (p-1)
    const combinedMetric = combineMetrics.call(this, node, ifBranch, elseBranch, conditionCase, [], pathStr + varName);

    // store combined results in scope
    sideEffectMetrics.push(combinedMetric);
    this.analyzer.setTypeWithConditions(varName, combinedType);
    this.analyzer.setMetricWithConditions(varName, this.analyzer.metric.store(combinedMetric));
  }

  // figure out the type the return type and metric of oblivIf expression
  const returnType = combineTypes(ifResult.type, elseResult.type, conditionMathEquation, pathStr + '[return]');
  const returnMetric = combineMetrics.call(this, node, ifResult, elseResult, conditionResult, sideEffectMetrics, pathStr + '[return]');
  // Note, above we DO NOT use metric.store(conditionResult.metric) since the metric of the condition has to be counted
  // exactly once somewhere in our handling, otherwise it is either ignored or over-counted

  // return results
  return {
    type: returnType,
    metric: returnMetric
  }
};

module.exports = {
  OblivIf: OblivIf
};