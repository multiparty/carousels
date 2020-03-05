const ReturnStatement = function (node, pathStr) {
  const childResult = this.visit(node, pathStr + '[returnExpression]');

  // Return statement not allowed in typings and costs: skip!
  const metricAgg = this.analyzer.metric.aggregateReturnStatement(node, childResult.type, childResult.metric);

  return {
    type: childResult.type,
    metric: metricAgg
  };
};

const FunctionCall = function (node, pathStr) {
  const func = node.function;
  const parameters = node.parameters;

  // Two cases: function is a name or a dotExpression
  let abstractionType, abstractionMetric;
  if (func.nodeType === 'NameExpression') {
  }
};

module.exports = {
  ReturnStatement: ReturnStatement,
  FunctionCall: FunctionCall
};