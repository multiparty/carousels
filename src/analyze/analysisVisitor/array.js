const carouselsTypes = require('../symbols/types.js');
const ranges = require('../ranges.js');

const ArrayAccess = function (node, pathStr) {
  const arrayResult = this.visit(node.array, pathStr + '[array]');
  const indexResult = this.visit(node.index, pathStr + '[index]');

  const childrenType = {
    array: arrayResult.type,
    index: indexResult.type
  };
  const childrenMetric = {
    array: arrayResult.metric,
    index: indexResult.metric
  };

  // ArrayAccess is not allowed in typings and costs: skip
  let type;
  if (arrayResult.type.hasDependentType('dataType')) {
    type = arrayResult.type.dependentType.dataType;
  } else {
    type = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.ANY, arrayResult.type.secret);
  }

  // aggregate metric
  const metric = this.analyzer.metric.aggregateArrayAccess(node, childrenType, childrenMetric);

  return {
    type: type,
    metric: metric
  };
};

const SliceExpression  = function (node, pathStr) {
  const arrayResult = this.visit(node.array, pathStr + '[array]');
  const rangeResult = this.visit(node.range, pathStr + '[range]');

  const childrenType = {
    array: arrayResult.type,
    range: rangeResult.type
  };
  const childrenMetric = {
    array: arrayResult.metric,
    range: rangeResult.metric
  };

  // figure out type of the resulting slice: it matches the array but with a different size
  if (!arrayResult.type.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    throw new Error('Expected Expression in slice to be of type array, found "' + arrayResult.type + '" instead!');
  }

  // find the slice length
  const sliceLength = ranges.size(this.analyzer, node);

  // find the dataType inside the slice
  let innerType;
  if (arrayResult.type.hasDependentType('dataType')) {
    innerType = arrayResult.type.dependentType.dataType;
  } else {
    innerType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.ANY, arrayResult.type.secret);
  }

  // create slice type
  const sliceDependentType = new carouselsTypes.ArrayDependentType(innerType, sliceLength);
  const type = new carouselsTypes.Type(arrayResult.type.dataType, arrayResult.type.secret, sliceDependentType);

  // aggregate metric
  const aggregateMetric = this.analyzer.metric.aggregateSliceExpression(node, childrenType, childrenMetric);

  // typings and costs not supported for slices: skip
  return {
    type: type,
    metric: aggregateMetric
  }
};

module.exports = {
  ArrayAccess: ArrayAccess,
  SliceExpression: SliceExpression
};