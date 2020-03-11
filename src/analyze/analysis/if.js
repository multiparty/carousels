const carouselsTypes = require('../symbols/types.js');
const Parameter = require('../symbols/parameter.js');
const math = require('../math.js');

const dependentIfCombiner = function (conditionMathEquation, ifVal, elseVal) {
  return math.iff(conditionMathEquation, ifVal, elseVal);
};

// Used for both If and OblivIf
const GenericIf = function (node, pathStr) {
  if (node.nodeType !== 'If' && node.nodeType !== 'OblivIf') {
    throw new Error('GenericIf Visitor called with an illegal node with type "' + node.nodeType + '"!');
  }

  const condition = node.condition;
  const ifBody = node.ifBody;
  const elseBody = node.elseBody;

  // visit children
  const conditionResult = this.visit(condition, pathStr + 'if[condition]');
  const ifResult = this.visit(ifBody, pathStr + 'if[body]');
  const elseResult = this.visit(elseBody, pathStr + 'else[body]');

  // turn the condition type into something actionable: a mathjs expression
  // that can be used in a symbolic if statement
  let conditionMathEquation;
  if (conditionResult.type.is(carouselsTypes.ENUM.BOOLEAN)) {
    conditionMathEquation = conditionResult.type.dependentType.value;
  } else if (conditionResult.type.is(carouselsTypes.ENUM.NUMBER)) {
    conditionMathEquation = math.neq(conditionResult.type.dependentType.value, 0);
  } else {
    const parameter = Parameter.forCondition(pathStr + 'if[condition]');
    this.analyzer.addParameters([parameter]);
    conditionMathEquation = parameter.mathSymbol;
  }

  // the (return) type of this statement is the union type of
  // the if and else bodies
  const ifType = ifResult.type;
  const elseType = elseResult.type;
  const type = ifType.combine(elseType, dependentIfCombiner.bind(this, conditionMathEquation));

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
    elseBody: elseResult.metric
  };
  const aggregateMetric = this.analyzer.metric['aggregate'+node.nodeType](node, childrenType, childrenMetric);

  // find cost in rules and apply it
  const elseTypeStr = elseType ? elseType.toString() : carouselsTypes.UNIT.toString();
  const typeString = conditionResult.type.toString() + '?' + ifType.toString() + ':' + elseTypeStr;
  const finalMetric = this.analyzer.costs.applyMatch(node, typeString, aggregateMetric);

  // return results
  return {
    type: type,
    metric: finalMetric
  }
};

module.exports = {
  If: GenericIf
};