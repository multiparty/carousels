const carouselsTypes = require('../symbols/types.js');
const Parameter = require('../symbols/parameter.js');
const math = require('../math.js');

// Used for both If and OblivIf
const If = function (node, pathStr) {
  const condition = node.condition;
  const ifBody = node.ifBody;
  const elseBody = node.elseBody;

  // visit children
  const conditionResult = this.visit(condition, pathStr + 'if[condition]');

  // turn the condition type into something actionable: a mathjs expression
  // that can be used in a symbolic iff statement
  let conditionMathEquation;
  if (conditionResult.type.is(carouselsTypes.ENUM.BOOL)) {
    conditionMathEquation = conditionResult.type.dependentType.value;
  } else if (conditionResult.type.is(carouselsTypes.ENUM.NUMBER)) {
    conditionMathEquation = math.neq(conditionResult.type.dependentType.value, math.parse('0'));
  } else {
    const parameter = Parameter.forCondition(pathStr + 'if[condition]');
    this.analyzer.addParameters([parameter]);
    conditionMathEquation = parameter.mathSymbol;
  }

  // add the condition to the conditions path
  this.analyzer.addScope();
  this.analyzer.conditionsPathTracker.add(conditionMathEquation);
  const ifResult = this.visit(ifBody, pathStr + 'if[body]');
  this.analyzer.removeScope();

  // add the negated condition to the conditions path
  this.analyzer.addScope();
  this.analyzer.conditionsPathTracker.add(math.not(conditionMathEquation));
  const elseResult = this.visit(elseBody, pathStr + 'else[body]');
  this.analyzer.removeScope();

  // the (return) type of this statement is the combined type of
  // the if and else bodies
  const ifType = ifResult.type;
  const elseType = elseResult ? elseResult.type : null;
  let type;
  if (ifType.is(carouselsTypes.ENUM.UNIT) || elseType == null || elseType.is(carouselsTypes.ENUM.UNIT)) {
    type = carouselsTypes.UNIT;
  } else {
    type = ifType.combine(elseType, conditionMathEquation);
  }

  // aggregate children metric
  const childrenType = {
    condition: conditionResult.type,
    conditionMath: conditionMathEquation,
    ifBody: ifType,
    elseBody: elseType
  };
  const childrenMetric = {
    condition: conditionResult.metric,
    ifBody: ifResult.metric,
    elseBody: elseResult ? elseResult.metric : this.analyzer.metric.initial
  };

  console.log(elseResult, childrenMetric);
  const aggregateMetric = this.analyzer.metric.aggregateIf(node, childrenType, childrenMetric);

  // return results
  return {
    type: type,
    metric: aggregateMetric
  }
};

module.exports = {
  If: If
};