const carouselsTypes = require('../symbols/types.js');

// empty sequences have no meaningful type
const defaultType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NULL, false);

// visit sequence: just an array of nodes
const Sequence = function (nodes) {
  const childrenMetrics = {};
  const childrenTypes = [];

  // visit each child node in the sequence
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const result = this.visit(node);
    if (result == null) { continue; } // TODO: remove

    childrenTypes.push(result.type);
    this.analyzer.mapMetrics(function (metricTitle) {
      childrenMetrics[metricTitle] = childrenMetrics[metricTitle] || [];
      childrenMetrics[metricTitle].push(result.metrics[metricTitle]);
    });
  }

  // We do not support rules matching sequences in typings: skip
  // aggregate metrics
  let aggregatedType = childrenTypes.length > 0 ? childrenTypes[childrenTypes.length - 1] : defaultType;
  const aggregatedMetrics = this.analyzer.mapMetrics(function (metricTitle, metricObject) {
    if (childrenMetrics[metricTitle]) {
      return metricObject.aggregateSequence(nodes, childrenTypes, childrenMetrics[metricTitle]);
    } else {
      return metricObject.initial;
    }
  });

  // We do not support rules matching sequences in costs: skip
  // nothing to update in scoped maps: skip
  // return aggregates
  return {
    type: aggregatedType,
    metrics: aggregatedMetrics
  }
};

module.exports = {
  Sequence: Sequence
};