const carouselsTypes = require('../symbols/types.js');
const Parameter = require('../symbols/parameter.js');
const math = require('../math.js');

// Used for both If and OblivIf
const OblivIf = function (node, pathStr) {
  const condition = node.condition;
  const ifBody = node.ifBody;
  const elseBody = node.elseBody;

  // visit children
  const conditionResult = this.visit(condition, pathStr + 'oblivIf[condition]');

  this.analyzer.addScope();
  const ifResult = this.visit(ifBody, pathStr + 'oblivIf[body]');
  this.analyzer.removeScope();

  this.analyzer.addScope();
  const elseResult = this.visit(elseBody, pathStr + 'oblivElse[body]');
  this.analyzer.removeScope();

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

  // figure out the type of both bodies and the return type of oblivIf
  const ifType = ifResult.type;
  const elseType = elseResult.type;

  // sanity checks
  if (ifType.is(carouselsTypes.ARRAY) || ifType.is(carouselsTypes.RANGE)) {
    throw new Error('OblivIf "' + pathStr + '" ifBody has illegal type "' + ifType.dataType + '"!')
  }
  if (elseType.is(carouselsTypes.ARRAY) || elseType.is(carouselsTypes.RANGE)) {
    throw new Error('OblivIf "' + pathStr + '" elseBody has illegal type "' + ifType.dataType + '"!')
  }
  if (ifType.dataType !== elseType.dataType) {
    throw new Error('OblivIf "' + pathStr + '" ifBody and elseBody return different types "' + ifType.dataType + '" and "' + elseType.dataType + '"!')
  }

  const type = ifType.combine(elseType, conditionMathEquation);
  type.secret = true; // whatever was given to oblivIf does not matter, return is always secret

  // aggregate children metric
  const childrenType = {
    condition: conditionResult.type,
    ifBody: ifType,
    elseBody: elseType
  };
  const childrenMetric = {
    condition: conditionResult.metric,
    ifBody: ifResult.metric,
    elseBody: elseResult.metric
  };
  const aggregateMetric = this.analyzer.metric.aggregateOblivIf(node, childrenType, childrenMetric);

  // find cost in rules and apply it
  const typeString = conditionResult.type.toString() + '?' + ifType.toString() + ':' + elseType.toString();
  const finalMetric = this.analyzer.costs.applyMatch(node, typeString, pathStr, aggregateMetric, childrenType, childrenMetric);

  // return results
  return {
    type: type,
    metric: finalMetric
  }
};

module.exports = {
  OblivIf: OblivIf
};