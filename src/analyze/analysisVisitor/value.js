const carouselsTypes = require('../symbols/types.js');
const math = require('../math.js');

const ArrayExpression = function (node, pathStr) {
  // visit children
  const childrenType = [];
  const childrenMetric = [];

  let aggType;
  let aggSecret = false;
  for (let i = 0; i < node.elements; i++) {
    const result = this.visit(node.elements[i], pathStr + '[' + i + ']');
    childrenType.push(result.type);
    childrenMetric.push(result.metric);

    aggSecret = aggSecret || result.type.secret;
    if (aggType == null) {
      aggType = result.type;
    } else if (aggType.dataType !== result.type.dataType) {
      aggType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.ANY, aggSecret);
    }
  }

  // find type of array
  // array is secret iff at least one element in it is secret
  // array has a specific datatype iff all elements have that type
  aggType.secret = aggSecret;
  const arrayDependentType = new carouselsTypes.ArrayDependentType(aggType, math.parse(node.elements.length));
  const type = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.ARRAY, aggSecret, arrayDependentType);

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
    end: endResult.metric
  };
  if (incrementResult) {
    childrenType.increment = incrementResult.type;
    childrenMetric.increment = incrementResult.metric;
  }

  // range is not supported for costs or typings: skip
  // find range type
  const type = new carouselsTypes.RangeType(childrenType.start, childrenType.end, childrenType.increment);

  // aggregate metric
  const metric = this.analyzer.metric.aggregateRangeExpression(node, childrenType, childrenMetric);

  // done
  return {
    type: type,
    metric: metric
  };
};

const LiteralExpression = function (node) {
  let type, val, dependentType;

  switch (node.type) {
    case 'number':
      val = math.parse(node.value);
      dependentType = new carouselsTypes.ValueDependentType(val);
      type = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, dependentType);
      break;

    case 'boolean':
      val = math.parse((node.value.trim() === '1' || node.value.toLowerCase().trim() === 'true').toString());
      dependentType = new carouselsTypes.ValueDependentType(val);
      type = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.BOOLEAN, false, dependentType);
      break;

    case 'string':
      type = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.STRING, false);
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