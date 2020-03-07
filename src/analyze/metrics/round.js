const AbstractMetric = require('../../ir/metric.js');

const math = require('../math.js');
const loop = require('../loops.js');

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
  DotExpression: 'left'
};

roundMetric.store = function (metric) {
  return metric;
};

// For Each: body * iterations
roundMetric.aggregateForEach = function (node, childrenType, childrenMetric) {
  const iterationCount = loop.iterationCountForEach(node, childrenType);
  const total = math.multiply(childrenMetric.body, iterationCount);
  return total;
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
roundMetric.aggregateFor = function (node, childrenType, childrenMetric) {
  const iterationCount = loop.iterationCountFor(node, childrenType);
  const body = math.add(childrenMetric.body, childrenMetric.condition, childrenMetric.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetric.condition, childrenMetric.initial);
  return total;
};

// If: only one of the two branches is executed
roundMetric.aggregateIf = function (node, childrenType, childrenMetric) {
  const max = math.max(childrenMetric.ifBody, childrenMetric.elseBody);
  const total = math.add(max, childrenMetric.condition);
  return total;
};

// OblivIf: both branches are always executed (but in parallel!)
roundMetric.aggregateOblivIf = function (node, childrenType, childrenMetric) {
  const max = math.max(childrenMetric.ifBody, childrenMetric.elseBody);
  const total = math.add(max, childrenMetric.condition);
  return total;
};

// NameExpression: return whatever is given (from scoped map)
roundMetric.aggregateNameExpression = function (node, childrenType, childrenMetric) {
  return childrenMetric;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
roundMetric.aggregateDirectExpression = function (node, childrenType, childrenMetric) {
  const totalExceptOperator = math.max.apply(null, childrenMetric.operands);
  return totalExceptOperator;
};

// ArrayAccess: aggregate Array and index
roundMetric.aggregateArrayAccess = function (node, childrenType, childrenMetric) {
  const total = math.max(childrenMetric.array, childrenMetric.index);
  return total;
};

// Range: aggregate start, end, and increment
roundMetric.aggregateRangeExpression = function (node, childrenType, childrenMetric) {
  const total = math.max(childrenMetric.start, childrenMetric.end, childrenMetric.increment);
  return total;
};

// Slice: aggregate the Array and the range
roundMetric.aggregateSliceExpression = function (node, childrenType, childrenMetric) {
  const total = math.max(childrenMetric.array, childrenMetric.range);
  return total;
};

// ArrayExpression: an array constructed from some elements directly
roundMetric.aggregateArrayExpression = function (node, childrenType, childrenMetric) {
  const total = math.max.apply(null, childrenMetric);
  return total;
};

// FunctionCall: aggregate parameters (and this if exists), the added cost of the function itself is factored in separately
roundMetric.aggregateFunctionCall = function (node, childrenType, childrenMetric) {
  const parameters = math.max.apply(null, childrenMetric.parameters);
  const total = math.max(parameters, childrenMetric.function); // represents 'this', will be 0 if there is no this!
  return total;
};

// Aggregate Statement / Expressions Sequences: things separated by ;
roundMetric.aggregateSequence = function (node, childrenType, childrenMetric) {
  const total = math.max.apply(null, childrenMetric);
  return total;
};

module.exports = roundMetric;