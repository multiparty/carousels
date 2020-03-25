const carouselsTypes = require('../symbols/types.js');

const ForEach = function (node, pathStr) {
  // we only support iterators that are direct names
  if (node.iterator.nodeType !== 'NameExpression') {
    throw new Error('Unsupported iterator node of type "' + node.iterator.nodeType +'", expected "NameExpression"!');
  }

  // Visit children!
  const childrenType = {};
  const childrenMetric = {};

  // range
  const rangeResult = this.visit(node.range, pathStr + '[range]');
  childrenType.range = rangeResult.type;
  childrenMetric.range = rangeResult.metric;

  // iterator type and metric are derived from the range
  const memberType = rangeResult.type.memberType(pathStr);
  childrenType.iterator = memberType.type;
  childrenMetric.iterator = rangeResult.metric;

  this.analyzer.addParameters(memberType.parameters);
  this.analyzer.addParameters(rangeResult.type.size(pathStr).parameters);

  // iterator is added to scope (as if it is a variable definition)
  this.analyzer.variableTypeMap.add(node.iterator.name, childrenType.iterator);
  this.analyzer.variableMetricMap.add(node.iterator.name, this.analyzer.metric.store(childrenMetric.iterator));
  this.analyzer.intermediateResults.push({ // for debugging
    node: node.iterator,
    result: {
      type: childrenType.iterator,
      metric: childrenMetric.iterator
    }
  });

  // body
  const bodyResult = this.visit(node.body, pathStr + '[body]');
  childrenType.body = bodyResult.type;
  childrenMetric.body = bodyResult.metric;

  // For Each is not supported by cost or typing rules: skip!
  // done
  return {
    type: carouselsTypes.UNIT,
    metric: this.analyzer.metric.aggregateForEach(node, childrenType, childrenMetric)
  };
};

module.exports = {
  ForEach: ForEach
};