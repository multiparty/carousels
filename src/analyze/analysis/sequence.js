const FunctionDetector = require('./functionDetector.js');
const carouselsTypes = require('../symbols/types.js');

// visit sequence: just an array of nodes
const Sequence = function (nodes, pathStr) {
  // make a copy of the function detector so we do not loose previously detected functions
  const _copyFunctionDetector = this.currentFunctionDetector;

  // Detect functions
  this.currentFunctionDetector = new FunctionDetector(this.analyzer);
  this.currentFunctionDetector.start(nodes, pathStr);
  this.currentFunctionDetector.putFunctionsInScope();

  const childrenMetric = [];
  const childrenType = [];

  // visit each child node in the sequence
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const result = this.visit(node, pathStr);

    childrenType.push(result.type);
    childrenMetric.push(result.metric);
  }

  // Put copy back
  this.currentFunctionDetector = _copyFunctionDetector;

  // We do not support rules matching sequences in typings: skip
  // We do not support rules matching sequences in costs: skip
  // nothing to update in scoped maps: skip
  // return aggregates
  return {
    type: childrenType.length > 0 ? childrenType[childrenType.length - 1] : carouselsTypes.UNIT,
    metric: this.analyzer.metric.aggregateSequence(nodes, childrenType, childrenMetric)
  }
};

module.exports = {
  Sequence: Sequence
};