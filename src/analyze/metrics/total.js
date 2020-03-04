const AbstractMetric = require('../../ir/metric.js');

const math = require('../math.js');
const loop = require('../loop.js');

// Total metric: aggregates cost by adding it across any construct's children
// Singleton instance of AbstractMetric
const totalMetric = new AbstractMetric('TotalMetric');

// Override Aggregation
totalMetric.defaults = {
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

totalMetric.store = function () {
  return math.ZERO;
};

// For Each: body * iterations
totalMetric.aggregateForEach = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const total = math.multiply(childrenMetrics.body, iterationCount);
  return total;
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
totalMetric.aggregateFor = function (node, childrenTypes, childrenMetrics) {
  const iterationCount = loop.iterationCount(node, childrenTypes);
  const body = math.add(childrenMetrics.body, childrenMetrics.condition, childrenMetrics.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetrics.condition, childrenMetrics.initial);
  return total;
};

// If: only one of the two branches is executed
totalMetric.aggregateIf = function (node, childrenTypes, childrenMetrics) {
  const max = math.max(childrenMetrics.ifBody, childrenMetrics.elseBody);
  const total = math.add(max, childrenMetrics.condition);
  return total;
};

// OblivIf: both branches are always executed
totalMetric.aggregateOblivIf = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.ifBody, childrenMetrics.elseBody, childrenMetrics.condition);
  return total;
};

// NameExpression: return whatever is given (from scoped map)
totalMetric.aggregateNameExpression = function (node, childrenTypes, childrenMetrics) {
  return childrenMetrics;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
totalMetric.aggregateDirectExpression = function (node, childrenTypes, childrenMetrics) {
  const totalExceptOperator = math.add.apply(null, childrenMetrics.operands);
  return totalExceptOperator;
};

// ArrayAccess: aggregate Array and index
totalMetric.aggregateArrayAccess = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.array, childrenMetrics.index);
  return total;
};

// Range: aggregate start, end, and increment
totalMetric.aggregateRangeExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.start, childrenMetrics.end, childrenMetrics.increment);
  return total;
};

// Slice: aggregate the Array and the range
totalMetric.aggregateSliceExpression = function (node, childrenTypes, childrenMetrics) {
  const total = math.add(childrenMetrics.array, childrenMetrics.range);
  return total;
};

// FunctionCall: aggregate parameters (and this if exists), the added cost of the function itself is factored in separately
totalMetric.aggregateFunctionCall = function (node, childrenTypes, childrenMetrics) {
  const parameters = math.add.apply(null, childrenMetrics.parameters);
  const total = math.add(parameters, childrenMetrics.function); // represents 'this', will be 0 if there is no this!
  return total;
};

// Aggregate Statement / Expressions Sequences: things separated by ;
totalMetric.aggregateSequence = function (node, childrenTypes, childrenMetrics) {
  const total = math.add.apply(null, childrenMetrics);
  return total;
};

module.exports = totalMetric;