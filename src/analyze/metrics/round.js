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

roundMetric.aggregateFor = function (node, childrenType, childrenMetric) {
  throw new Error('Regular for loops are not yet supported! use for each');
};

// If: only one of the two branches is executed
roundMetric.aggregateIf = function (node, childrenType, childrenMetric) {
  if (childrenMetric.condition.toString() !== '0') {
    console.log('Warning: Plain if condition has non-zero metric condition in rounds metrics, rounds may be under-estimated...');
  }

  // condition is public and can be ignored
  const bodiesCost = math.iff(childrenType.conditionMath, childrenMetric.ifBody, childrenMetric.elseBody);
  return math.max(childrenMetric.condition, bodiesCost);
};

// OblivIf: both branches as well as condition are executed in parallel in parallel
roundMetric.aggregateOblivIf = function (node, childrenType, childrenMetric) {
  // other side effects are ignored, their rounds are attached to their variables
  return math.max(childrenMetric.condition, childrenMetric.ifBody, childrenMetric.elseBody);
};

// NameExpression: return whatever is given (from scoped map)
roundMetric.aggregateNameExpression = function (node, childrenType, childrenMetric) {
  return childrenMetric;
};

// DirectExpression: aggregate operands, the added cost of operation is factored in separately
roundMetric.aggregateDirectExpression = function (node, childrenType, childrenMetric) {
  return math.max.apply(null, childrenMetric.operands);
};

// ArrayAccess: aggregate Array and index
roundMetric.aggregateArrayAccess = function (node, childrenType, childrenMetric) {
  return math.max(childrenMetric.array, childrenMetric.index);
};

// Range: aggregate start, end, and increment
roundMetric.aggregateRangeExpression = function (node, childrenType, childrenMetric) {
  return math.max(childrenMetric.start, childrenMetric.end, childrenMetric.increment);
};

// Slice: aggregate the Array and the range
roundMetric.aggregateSliceExpression = function (node, childrenType, childrenMetric) {
  return math.max(childrenMetric.array, childrenMetric.range);
};

// ArrayExpression: an array constructed from some elements directly
roundMetric.aggregateArrayExpression = function (node, childrenType, childrenMetric) {
  return math.max.apply(null, childrenMetric);
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

  return math.max.apply(null, allParams);
};

// Aggregate Statement / Expressions Sequences: things separated by ;
roundMetric.aggregateSequence = function (node, childrenType, childrenMetric) {
  if (childrenMetric == null || childrenMetric.length === 0) {
    return math.ZERO;
  }
  return childrenMetric[childrenMetric.length - 1];
};

module.exports = roundMetric;