const carouselsTypes = require('../symbols/types.js');
const math = require('../math.js');

const ListNodesVisitor = require('../helpers/list.js');
const StringifyVisitor = require('../helpers/stringify.js');

const ALLOWED_IN_CONDITION = ['DirectExpression', 'NameExpression', 'LiteralExpression', 'DotExpression', 'FunctionCall'];
const listNodesVisitor = new ListNodesVisitor();
const stringifyVisitor = new StringifyVisitor(null, false);

const dependentIfCombiner = function (condition, ifVal, elseVal) {
  if (listNodesVisitor.containsOnly(condition, ALLOWED_IN_CONDITION)) {
    const conditionExpressionString = math.parse(stringifyVisitor.start(condition));
    return math.iff(conditionExpressionString, ifVal, elseVal);
  } else {
    return math.max(ifVal, elseVal);
  }
};

const If = function (node, pathStr) {
  const condition = node.condition;
  const ifBody = node.ifBody;
  const elseBody = node.elseBody;

  // visit children
  const conditionResult = this.visit(condition, pathStr + 'if[condition]');
  const ifResult = this.visit(ifBody, pathStr + 'if[body]');
  const elseResult = this.visit(elseBody, pathStr + 'else[body]');

  // the (return) type of this statement is the union type of
  // the if and else bodies
  const ifType = ifResult.type;
  const elseType = elseResult.type;
  const type = ifType.combine(elseType, dependentIfCombiner.bind(this, condition));

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
  const aggregateMetric = this.analyzer.metric.aggregateIf(node, childrenType, childrenMetric);

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
  If: If
};