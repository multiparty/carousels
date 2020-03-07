const AbstractMetric = require('../../ir/metric.js');

const math = require('../math.js');
const loop = require('../loops.js');

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
  DotExpression: 'left'
};

totalMetric.store = function () {
  return math.ZERO;
};

// For Each: body * iterations
totalMetric.aggregateForEach = function (node, childrenType, childrenMetric) {
  const iterationCount = loop.iterationCountForEach(node, childrenType);
  const total = math.multiply(childrenMetric.body, iterationCount);
  return total;
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
totalMetric.aggregateFor = function (node, childrenType, childrenMetric) {
  const iterationCount = loop.iterationCountFor(node, childrenType);
  const body = math.add(childrenMetric.body, childrenMetric.condition, childrenMetric.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetric.condition, childrenMetric.initial);
  return total;
};

// If: only one of the two branches is executed
totalMetric.aggregateIf = function (node, childrenType, childrenMetric) {
  const max = math.max(childrenMetric.ifBody, childrenMetric.elseBody);
  const total = math.add(max, childrenMetric.condition);
  return total;
};

// OblivIf: both branches are always executed
totalMetric.aggregateOblivIf = function (node, childrenType, childrenMetric) {
  const total = math.add(childrenMetric.ifBody, childrenMetric.elseBody, childrenMetric.condition);
  return total;
};

// NameExpression: return whatever is given (from scoped map)
totalMetric.aggregateNameExpression = function (node, childrenType, childrenMetric) {
  return childrenMetric;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
totalMetric.aggregateDirectExpression = function (node, childrenType, childrenMetric) {
  const totalExceptOperator = math.add.apply(null, childrenMetric.operands);
  return totalExceptOperator;
};

// ArrayAccess: aggregate Array and index
totalMetric.aggregateArrayAccess = function (node, childrenType, childrenMetric) {
  const total = math.add(childrenMetric.array, childrenMetric.index);
  return total;
};

// Range: aggregate start, end, and increment
totalMetric.aggregateRangeExpression = function (node, childrenType, childrenMetric) {
  const total = math.add(childrenMetric.start, childrenMetric.end, childrenMetric.increment);
  return total;
};

// Slice: aggregate the Array and the range
totalMetric.aggregateSliceExpression = function (node, childrenType, childrenMetric) {
  const total = math.add(childrenMetric.array, childrenMetric.range);
  return total;
};

// ArrayExpression: an array constructed from some elements directly
totalMetric.aggregateArrayExpression = function (node, childrenType, childrenMetric) {
  const total = math.max.add(null, childrenMetric);
  return total;
};

// FunctionCall: aggregate parameters (and this if exists), the added cost of the function itself is factored in separately
totalMetric.aggregateFunctionCall = function (node, childrenType, childrenMetric) {
  const parameters = math.add.apply(null, childrenMetric.parameters);
  const total = math.add(parameters, childrenMetric.function); // represents 'this', will be 0 if there is no this!
  return total;
};

// Aggregate Statement / Expressions Sequences: things separated by ;
totalMetric.aggregateSequence = function (node, childrenType, childrenMetric) {
  const total = math.add.apply(null, childrenMetric);
  return total;
};

module.exports = totalMetric;