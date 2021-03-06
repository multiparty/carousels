const carouselsTypes = require('../symbols/types.js');

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

  // expect that array is of type array or matrix
  if (!arrayResult.type.is(carouselsTypes.ENUM.ARRAY) && !arrayResult.type.is(carouselsTypes.ENUM.MATRIX)) {
    throw new Error('Expected Expression in ArrayAccess to be of type array or matrix, found "' + arrayResult.type + '" instead!');
  }

  // find typing rule if it exists
  let type;
  const typeString = arrayResult.type.toString() + '[' + indexResult.type.toString() + ']';
  if (this.analyzer.typings.findMatch(node, typeString) !== undefined) {
    type = this.analyzer.typings.applyMatch(node, typeString, pathStr, childrenType);
  } else {
    if (arrayResult.type.is(carouselsTypes.ENUM.ARRAY)) {
      type = arrayResult.type.dependentType.elementsType.copy();
    } else if (arrayResult.type.is(carouselsTypes.ENUM.MATRIX)) {
      // Access into (NxM) Matrix gives a (Mx1) Vector
      // Special Case: (Nx1) Matrix (essentially vector) gives a (1x1) Vector, i.e. an element directly..
      if (arrayResult.type.dependentType.cols.toString() === '1') {
        type = arrayResult.type.dependentType.elementsType.copy();
      } else {
        type = new carouselsTypes.MatrixType(arrayResult.type.dependentType.elementsType.copy(), arrayResult.type.dependentType.cols, '1');
      }
    }
  }

  // aggregate metric
  const aggregateMetric = this.analyzer.metric.aggregateArrayAccess(node, childrenType, childrenMetric);

  // find cost in rules and apply it
  const finalMetric = this.analyzer.costs.applyMatch(node, typeString, pathStr, aggregateMetric, childrenType, childrenMetric);

  // done
  return {
    type: type,
    metric: finalMetric
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
  if (!arrayResult.type.is(carouselsTypes.ENUM.ARRAY)) {
    throw new Error('Expected Expression in SliceExpression to be of type array, found "' + arrayResult.type + '" instead!');
  }

  // find the slice length
  const sliceLength = rangeResult.type.dependentType.size;

  // find the dataType inside the slice
  let innerType = arrayResult.type.dependentType.elementsType;

  // create slice type
  const type = new carouselsTypes.ArrayType(arrayResult.type.secret, innerType, sliceLength);

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