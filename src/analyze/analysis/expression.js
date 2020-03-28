const carouselsTypes = require('../symbols/types.js');

const ParenthesesExpression = function (node, pathStr) {
  return this.visit(node.expression, pathStr);
};

const DirectExpression = function (node, pathStr) {
  // visit children
  const operator = node.operator;
  const childrenType = {operands: []};
  const childrenMetric = {operands: []};

  for (let i = 0; i < node.operands.length; i++) {
    const child = this.visit(node.operands[i], pathStr + '[operand' + (i+1) +']');
    childrenType.operands.push(child.type);
    childrenMetric.operands.push(child.metric);
  }

  // Find matches in typing if exists
  let expressionTypeStr = childrenType.operands.join(operator);
  if (node.operands.length === 1) {
    expressionTypeStr = operator + expressionTypeStr;
  }
  const finalType = this.analyzer.typings.applyMatch(node, expressionTypeStr, pathStr, childrenType);

  // Aggregate children metrics
  const aggregateMetric = this.analyzer.metric.aggregateDirectExpression(node, childrenType, childrenMetric);

  // Apply cost rule if exists
  const finalMetric = this.analyzer.costs.applyMatch(node, expressionTypeStr, pathStr, aggregateMetric, childrenType, childrenMetric);

  // Done
  return {
    type: finalType,
    metric: finalMetric
  };
};

const DotExpression = function (node, pathStr) {
  // visit children
  const leftResult = this.visit(node.left, pathStr + '[.left]');

  if (node.right.nodeType !== 'NameExpression') {
    throw new Error('Unsupported expression "' + node.right.nodeType + '" to right of the "."!');
  }

  const rightResult = {
    type: new carouselsTypes.SymbolType(node.right.name),
    metric: this.analyzer.metric.initial
  };

  const childrenType = {
    left: leftResult.type,
    right: rightResult.type
  };
  const childrenMetric = {
    left: leftResult.metric,
    right: rightResult.metric
  };

  // Look for match in typing
  const expressionTypeStr = leftResult.type.toString() + '.' + rightResult.type.toString();

  const finalType = this.analyzer.typings.applyMatch(node, expressionTypeStr, pathStr,  childrenType);

  // Metric aggregation
  const aggregateMetric = this.analyzer.metric.aggregateDotExpression(node, childrenType, childrenMetric);

  // Apply cost to metric
  const finalMetric = this.analyzer.costs.applyMatch(node, expressionTypeStr, pathStr, aggregateMetric, childrenType, childrenMetric);

  return {
    type: finalType,
    metric: finalMetric,
    // only used if parent is functionCall
    leftType: leftResult.type,
    rightType: rightResult.type
  };
};

// When name expression is visited, it can only be visited
// in the role of referring to a variable in some expression
// Other occurrences of NameExpression are handled without visit by their parents
const NameExpression = function (node, pathStr) {
  let type;
  let metric;

  // read type and metric from scope (if exists)
  type = this.analyzer.variableTypeMap.get(node.name, null);
  metric = this.analyzer.variableMetricMap.get(node.name, null);

  // Find type in case of special (global) variables
  let symbol = false;
  if (type == null) {
    type = this.analyzer.typings.applyMatch(node, node.name, pathStr, null);
    symbol = true;
  }
  if (metric == null) {
    metric = this.analyzer.metric.initial;
  }

  // aggregate metric
  metric = this.analyzer.metric.aggregateNameExpression(node, type, metric);

  // find costs if any
  if (symbol) {
    metric = this.analyzer.costs.applyMatch(node, node.name, pathStr, metric, null, null);
  }

  // no children to visit
  // get the metric and type from the scope
  return {
    type: type,
    metric: metric
  };
};

module.exports = {
  ParenthesesExpression: ParenthesesExpression,
  DirectExpression: DirectExpression,
  DotExpression: DotExpression,
  NameExpression: NameExpression
};