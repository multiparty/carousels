const carouselsTypes = require('../symbols/types.js');

const ForEach = function (node, pathStr) {
  // Visit children!
  const childrenType = {};
  const childrenMetric = {};

  // iterator
  const iteratorResult = this.visit(node.iteratorDefinition, pathStr + '[iterator]');
  childrenType.iteratorDefinition = iteratorResult.type;
  childrenMetric.iteratorDefinition = iteratorResult.metric;

  // range
  const rangeResult = this.visit(node.range, pathStr + '[range]');
  childrenType.range = rangeResult.type;
  childrenMetric.range = rangeResult.metric;

  // body
  const bodyResult = this.visit(node.body, pathStr + '[body]');
  childrenType.body = bodyResult.type;
  childrenMetric.body = bodyResult.metric;

  // For Each is not supported by cost or typing rules: skip!
  // done
  return {
    type: carouselsTypes.UNIT_TYPE,
    metric: this.analyzer.metric.aggregateForEach(node, childrenType, childrenMetric)
  };
};

const For = function () {
  throw new Error('Regular For loops are not yet supported! use for each instead!');
};

module.exports = {
  For: For,
  ForEach: ForEach
};