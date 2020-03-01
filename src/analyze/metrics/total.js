const math = require('../math.js');
const AbstractMetric = require('../../ir/metric.js');
const loop = require('../loop.js');

// Total metric: aggregates cost by adding it accross any construct's children
function TotalMetric(value) {
  if (value == null) {
    value = math.ZERO;
  }
  AbstractMetric.call(this, 'TotalMetric', value);
}

// Inherit AbstractMetric
TotalMetric.prototype = Object.create(AbstractMetric.prototype);

// Override Aggregation
TotalMetric.prototype.defaults = {
  TypeNode: math.ZERO,
  FunctionDefinition: 'body',
  ReturnStatement: 'expression',
  VariableDefinition: math.ZERO,
  VariableAssignment: 'expression',
  LiteralExpression: math.ZERO,
  ParenthesesExpression: 'expression',
  RangeExpression: math.ZERO,
  SliceExpression: 'array',
  ArrayExpression: math.ZERO,
  DotExpression: 'left'
};

// For Each: body * iterations
TotalMetric.prototype.aggregateForEach = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const total = math.multiply(childrenMetrics.body, iterationCount);
  return new TotalMetric(total);
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
TotalMetric.prototype.aggregateFor = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const body = math.add(childrenMetrics.body, childrenMetrics.condition, childrenMetrics.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetrics.condition, childrenMetrics.initial);
  return new TotalMetric(total);
};

// If: only one of the two branches is executed
TotalMetric.prototype.aggregateIf = function (node, childrenTypes, childrenMetrics) {
  const max = math.max(childrenMetrics.ifBody, childrenMetrics.elseBody);
  const total = math.add(max, childrenMetrics.condition);
  return new TotalMetric(total);
};

// OblivIf: both branches are always executed
TotalMetric.prototype.aggregateOblivIf = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.ifBody, childrenMetrics.elseBody, childrenMetrics.condition);
  return new TotalMetric(total);
};

// NameExpression: return whatever is given (from scoped map)
TotalMetric.prototype.aggregateNameExpression = function (node, childrenTypes, childrenMetrics) {
  return childrenMetrics;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
TotalMetric.prototype.aggregateDirectExpression = function (node, childrenTypes, childrenMetrics) {
  const totalExceptOperator = math.add.apply(null, childrenMetrics.operands);
  return new TotalMetric(totalExceptOperator);
};

// ArrayAccess: aggregate Array and index
TotalMetric.prototype.aggregateArrayAccess = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.array, childrenMetrics.index);
  return new TotalMetric(total);
};

// Range: aggregate start, end, and increment
TotalMetric.prototype.aggregateRangeExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.start, childrenMetrics.end, childrenMetrics.increment);
  return new TotalMetric(total);
};

// Slice: aggregate the Array and the range
TotalMetric.prototype.aggregateSliceExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.array, childrenMetrics.range);
  return new TotalMetric(total);
};

// FunctionCall: aggregate parameters (and this if exists), the added cost of the function itself is factored in separately
TotalMetric.prototype.aggregateFunctionCall = function (node, childrenTypes, childrenMetrics) {
  const parameters = math.add.apply(null, childrenMetrics.parameters);
  const total = math.add(parameters, childrenMetrics.function); // represents 'this', will be 0 if there is no this!
  return new TotalMetric(total);
};

// Aggregate Statement / Expressions Sequences: things separated by ;
TotalMetric.prototype.aggregateSequence = function (node, childrenTypes, childrenMetrics) {
  const total = math.add.apply(null, childrenMetrics);
  return new TotalMetric(total);
};
