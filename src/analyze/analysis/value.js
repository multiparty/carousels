const carouselsTypes = require('../symbols/types.js');
const math = require('../math.js');

const ArrayExpression = function (node, pathStr) {
  // visit children
  const childrenType = [];
  const childrenMetric = [];

  let aggType = null;
  let aggSecret = false;
  let error = false;
  for (let i = 0; i < node.elements.length; i++) {
    const result = this.visit(node.elements[i], pathStr + '[' + i + ']');
    childrenType.push(result.type);
    childrenMetric.push(result.metric);

    aggSecret = aggSecret || result.type.secret;
    if (aggType == null) {
      aggType = result.type;
    } else if (!aggType.match(result.type)) {
      if (aggType.secret === result.type.secret) {
        aggType = new carouselsTypes.AnyType(aggSecret);
      } else {
        error = true;
      }
    }
  }

  if (error) {
    throw new Error('Found conflicting secret and non-secret types in Array expression');
  }

  // find type of array
  // array is secret iff at least one element in it is secret
  // array has a specific datatype iff all elements have that type
  aggType.secret = aggSecret;
  const type = new carouselsTypes.ArrayType(aggSecret, aggType, math.parse(node.elements.length));

  // aggregate metric
  const aggregateMetric = this.analyzer.metric.aggregateArrayExpression(node, childrenType, childrenMetric);

  return {
    type: type,
    metric: aggregateMetric
  };
};

const RangeExpression = function (node, pathStr) {
  // visit children
  const startResult = this.visit(node.start, pathStr + '[start]');
  const endResult = this.visit(node.end, pathStr + '[end]');
  const incrementResult = this.visit(node.increment, pathStr + '[increment]');

  const childrenType = {
    start: startResult.type,
    end: endResult.type
  };
  const childrenMetric = {
    start: startResult.metric,
    end: endResult.metric,
    increment: this.analyzer.metric.initial
  };
  if (incrementResult) {
    childrenType.increment = incrementResult.type;
    childrenMetric.increment = incrementResult.metric;
  }

  // range is not supported for costs or typings: skip
  // find range type
  const rangeResult = new carouselsTypes.RangeType.fromComponents(childrenType.start, childrenType.end, childrenType.increment, pathStr);
  const rangeType = rangeResult.type;
  this.analyzer.addParameters(rangeResult.parameters);

  // aggregate metric
  const metric = this.analyzer.metric.aggregateRangeExpression(node, childrenType, childrenMetric);

  // done
  return {
    type: rangeType,
    metric: metric
  };
};

const LiteralExpression = function (node) {
  let type, val;

  switch (node.type) {
    case 'number':
      val = math.parse(node.value);
      type = new carouselsTypes.NumberType(false, val);
      break;

    case 'bool':
      val = math.parse((node.value.trim() === '1' || node.value.toLowerCase().trim() === 'true').toString());
      type = new carouselsTypes.BooleanType(false, val);
      break;

    case 'str':
      type = new carouselsTypes.StringType(false);
      break;

    case 'float':
      val = math.parse(node.value);
      type = new carouselsTypes.FloatType(false, val);
      break;

    default:
      throw new Error('Unsupported Literal Type "' + node.type + '"');
  }

  return {
    type: type,
    metric: this.analyzer.metric.aggregateLiteralExpression(node, type, {})
  }
};

module.exports = {
  ArrayExpression: ArrayExpression,
  RangeExpression: RangeExpression,
  LiteralExpression: LiteralExpression
};