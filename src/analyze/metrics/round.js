const math = require('../math.js');
const AbstractMetric = require('../../ir/metric.js');
const loop = require('../loop.js');

// Total metric: aggregates cost by adding it accross any construct's children
function RoundMetric(value) {
  if (value == null) {
    value = math.ZERO;
  }
  AbstractMetric.call(this, 'TotalMetric', value);
}

// Inherit AbstractMetric
RoundMetric.prototype = Object.create(AbstractMetric.prototype);

// Override Aggregation
RoundMetric.prototype.defaults = {
  TypeNode: math.ZERO,
  FunctionDefinition: 'body',
  ReturnStatement: 'expression',
  VariableDefinition: math.ZERO,
  VariableAssignment: 'expression',
  LiteralExpression: math.ZERO,
  ParenthesesExpression: 'expression',
  ArrayExpression: math.ZERO,
  DotExpression: 'left'
};

// For Each: body * iterations
RoundMetric.prototype.aggregateForEach = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const total = math.multiply(childrenMetrics.body, iterationCount);
  return new RoundMetric(total);
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
RoundMetric.prototype.aggregateFor = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const body = math.add(childrenMetrics.body, childrenMetrics.condition, childrenMetrics.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetrics.condition, childrenMetrics.initial);
  return new RoundMetric(total);
};

// If: only one of the two branches is executed
RoundMetric.prototype.aggregateIf = function (node, childrenTypes, childrenMetrics) {
  const max = math.max(childrenMetrics.ifBody, childrenMetrics.elseBody);
  const total = math.add(max, childrenMetrics.condition);
  return new RoundMetric(total);
};

// OblivIf: both branches are always executed (but in parallel!)
RoundMetric.prototype.aggregateOblivIf = function (node, childrenTypes, childrenMetrics) {
  const max = math.max(childrenMetrics.ifBody, childrenMetrics.elseBody);
  const total = math.add(max, childrenMetrics.condition);
  return new RoundMetric(total);
};

// NameExpression: return whatever is given (from scoped map)
RoundMetric.prototype.aggregateNameExpression = function (node, childrenTypes, childrenMetrics) {
  return childrenMetrics;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
RoundMetric.prototype.aggregateDirectExpression = function (node, childrenTypes, childrenMetrics) {
  const totalExceptOperator = math.max.apply(null, childrenMetrics.operands);
  return new RoundMetric(totalExceptOperator);
};

// ArrayAccess: aggregate Array and index
RoundMetric.prototype.aggregateArrayAccess = function (node, childrenTypes, childrenMetrics) {
  const total = math.max(childrenMetrics.array, childrenMetrics.index);
  return new RoundMetric(total);
};

// Range: aggregate start, end, and increment
RoundMetric.prototype.aggregateRangeExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.max(childrenMetrics.start, childrenMetrics.end, childrenMetrics.increment);
  return new RoundMetric(total);
};

// Slice: aggregate the Array and the range
RoundMetric.prototype.aggregateSliceExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.max(childrenMetrics.array, childrenMetrics.range);
  return new RoundMetric(total);
};

// FunctionCall: aggregate parameters (and this if exists), the added cost of the function itself is factored in separately
RoundMetric.prototype.aggregateFunctionCall = function (node, childrenTypes, childrenMetrics) {
  const parameters = math.max.apply(null, childrenMetrics.parameters);
  const total = math.max(parameters, childrenMetrics.function); // represents 'this', will be 0 if there is no this!
  return new RoundMetric(total);
};

// Aggregate Statement / Expressions Sequences: things separated by ;
RoundMetric.prototype.aggregateSequence = function (node, childrenTypes, childrenMetrics) {
  const total = math.max.apply(null, childrenMetrics);
  return new RoundMetric(total);
};
