const AbstractMetric = require('../../ir/metric.js');

const math = require('../math.js');
const loop = require('../loop.js');

// Round metric: aggregates cost along paths in the code dependency graph (through the depth of the circuit)
// Singleton object instantiated from AbstractMetric
const roundMetric = new AbstractMetric('RoundMetric');

// Override Aggregation
roundMetric.defaults = {
  TypeNode: math.ZERO,
  FunctionDefinition: math.ZERO,
  ReturnStatement: 'expression',
  VariableDefinition: 'assignment',
  VariableAssignment: 'expression',
  LiteralExpression: math.ZERO,
  ParenthesesExpression: 'expression',
  ArrayExpression: math.ZERO,
  DotExpression: 'left'
};

roundMetric.store = function (metric) {
  return metric;
};

// For Each: body * iterations
roundMetric.aggregateForEach = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const total = math.multiply(childrenMetrics.body, iterationCount);
  return total;
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
roundMetric.aggregateFor = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const body = math.add(childrenMetrics.body, childrenMetrics.condition, childrenMetrics.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetrics.condition, childrenMetrics.initial);
  return total;
};

// If: only one of the two branches is executed
roundMetric.aggregateIf = function (node, childrenTypes, childrenMetrics) {
  const max = math.max(childrenMetrics.ifBody, childrenMetrics.elseBody);
  const total = math.add(max, childrenMetrics.condition);
  return total;
};

// OblivIf: both branches are always executed (but in parallel!)
roundMetric.aggregateOblivIf = function (node, childrenTypes, childrenMetrics) {
  const max = math.max(childrenMetrics.ifBody, childrenMetrics.elseBody);
  const total = math.add(max, childrenMetrics.condition);
  return total;
};

// NameExpression: return whatever is given (from scoped map)
roundMetric.aggregateNameExpression = function (node, childrenTypes, childrenMetrics) {
  return childrenMetrics;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
roundMetric.aggregateDirectExpression = function (node, childrenTypes, childrenMetrics) {
  const totalExceptOperator = math.max.apply(null, childrenMetrics.operands);
  return totalExceptOperator;
};

// ArrayAccess: aggregate Array and index
roundMetric.aggregateArrayAccess = function (node, childrenTypes, childrenMetrics) {
  const total = math.max(childrenMetrics.array, childrenMetrics.index);
  return total;
};

// Range: aggregate start, end, and increment
roundMetric.aggregateRangeExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.max(childrenMetrics.start, childrenMetrics.end, childrenMetrics.increment);
  return total;
};

// Slice: aggregate the Array and the range
roundMetric.aggregateSliceExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.max(childrenMetrics.array, childrenMetrics.range);
  return total;
};

// FunctionCall: aggregate parameters (and this if exists), the added cost of the function itself is factored in separately
roundMetric.aggregateFunctionCall = function (node, childrenTypes, childrenMetrics) {
  const parameters = math.max.apply(null, childrenMetrics.parameters);
  const total = math.max(parameters, childrenMetrics.function); // represents 'this', will be 0 if there is no this!
  return total;
};

// Aggregate Statement / Expressions Sequences: things separated by ;
roundMetric.aggregateSequence = function (node, childrenTypes, childrenMetrics) {
  const total = math.max.apply(null, childrenMetrics);
  return total;
};

module.exports = roundMetric;