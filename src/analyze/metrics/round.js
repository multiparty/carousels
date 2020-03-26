const AbstractMetric = require('../../ir/metric.js');

const math = require('../math.js');

// Round metric: aggregates cost along paths in the code dependency graph (through the depth of the circuit)
// Singleton object instantiated from AbstractMetric
const roundMetric = new AbstractMetric('RoundMetric');

// Override Aggregation
roundMetric.defaults = {
  TypeNode: math.ZERO,
  FunctionDefinition: math.ZERO,
  ReturnStatement: 'expression',
  VariableAssignment: 'expression',
  LiteralExpression: math.ZERO,
  ParenthesesExpression: 'expression',
  DotExpression: 'left'
};

roundMetric.store = function (metric) {
  return metric;
};

// Variable definition: prioritize assignment over declaration
roundMetric.aggregateVariableDefinition = function (node, childrenType, childrenMetric) {
  if (childrenMetric.assignment) {
    return childrenMetric.assignment;
  }
  if (childrenMetric.type) {
    return childrenMetric.type;
  }
  return math.ZERO;
};

// For Each: body * iterations
roundMetric.aggregateForEach = function (node, childrenType, childrenMetric) {
  return math.max(childrenMetric.body, childrenMetric.previousIterationMetric);
};

// Regular For: (body + condition + increment) * iterations + condition + initialization (one extra condition evaluation)
roundMetric.aggregateFor = function (node, childrenType, childrenMetric) {
  throw new Error('Regular for loops are not yet supported! use for each');
  /*
  const body = math.add(childrenMetric.body, childrenMetric.condition, childrenMetric.increment);
  const bodyIterated = math.multiply(body, iterationCount);
  const total = math.add(bodyIterated, childrenMetric.condition, childrenMetric.initial);
  return total;
  */
};

// If: only one of the two branches is executed
roundMetric.aggregateIf = function (node, childrenType, childrenMetric) {
  const bodies = math.iff(childrenType.conditionMath, childrenMetric.ifBody, childrenMetric.elseBody);
  const total = math.add(bodies, childrenMetric.condition);
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
  const allParams = childrenMetric.parameters.slice();
  if (childrenMetric.function) {
    // the cost of the function context itself (e.g. the cost of `this`)
    // for most intents and purposes this is 0
    allParams.unshift(childrenMetric.function);
  }
  if (childrenMetric.call) {
    // the total cost of the function call, given for locally defined functions only, an absolute quantity
    // external functions do not provide a call attribute
    // their added (relative) cost is looked up in the costs rules and applied separately
    allParams.push(childrenMetric.call);
  }

  const total = math.max.apply(null, allParams);
  return total;
};

// Aggregate Statement / Expressions Sequences: things separated by ;
roundMetric.aggregateSequence = function (node, childrenType, childrenMetric) {
  const total = math.max.apply(null, childrenMetric);
  return total;
};

module.exports = roundMetric;