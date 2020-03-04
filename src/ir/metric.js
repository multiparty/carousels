const math = require('../analyze/math.js');
const IR_NODES = require('./ir.js');

/*
 * Abstract metric
 *
 * This is a class that defines the API of a metric
 * Concrete metrics are constructed as instances of this class, and share its API.
 *
 * Metrics are an immutable object, they should never be modified in place.
 *
 * Our analysis visitor pattern attached a metric instance to every expression/statement
 * in a program as well as every named construct (variable and functions).
 *
 * Metrics attached to expressions/statements are ephemeral, they are destroyed once their
 * respective construct is consumed. The metric instance attached to a desired output construct
 * is the final output for that construct for that type of metric.
 *
 * Metrics attached to variables/functions are stored in scoped maps, which is a layered map that
 * allows us to mimic the scoping semantics of the analyzed language: variables may be shadowed
 * in nested scoped, and uncovered once that nested scope is done.
 *
 * Metric objects have three important (families of) operations:
 * 1. Metric and cost addition: specifies how a metric instance can be transformed when a known
 *    symbolic or concrete cost is aggregated with it. This is the basic building block of the
 *    metric that usually happens at leaf expressions (e.g. +).
 * 2. Metrics aggregation at IRNode: specifies what the metric corresponding to the program IRNode
 *    should be, given the metric instances of all the children of that IRNode. This is a composition
 *    step that usually happens at higher level statements and expressions (e.g. for loops)
 * 3. Attaching a metric to a variable and storing it: specifies the metric value to store in the
 *    variable metric map. Allows metric to customize how metrics are aggregated on variable use.
 *
 * Finally, every concrete Metric should provide an initial value, that is used to initialize the metric
 * for atomic program constructs (new variables and constants).
 */
function AbstractMetric(name) {
  this.name = name;
}

AbstractMetric.prototype.initial = math.ZERO;

AbstractMetric.prototype.defaults = {};

AbstractMetric.prototype.addCost = function (metric, cost) {
  return math.add(metric, cost);
};

AbstractMetric.prototype.store = function (metric) {
  throw new Error('Metric "' + this.name + '" does not implement store()!');
};

// Default visitor used for node types for which a user visitor was not set
const defaultAggregate =  function (node, childrenTypes, childrenMetrics) {
  const nodeType = node.nodeType;
  if (this.defaults[nodeType] == null) {
    throw new Error('Metric Aggregation for "' + this.name + '" and node "' + nodeType + '" is not implemented!');
  }

  const childMetric = childrenMetrics[this.defaults[nodeType]];
  if (childMetric == null) {
    return this.defaults[nodeType];
  }
  return childMetric;
};
for (let i = 0; i < IR_NODES.length; i++) {
  const nodeType = IR_NODES[i];
  AbstractMetric.prototype['aggregate'+nodeType] = defaultAggregate;
}

// Special aggregate for sequenced statements: statements in code blocks separated by ;
AbstractMetric.prototype.aggregateSequence = function (node, childrenTypes, childrenMetrics) {
  // node: the node that contains this code block (null for top level block)
  // childrenTypes: the value type of the very last statement/expression
  // childrenMetrics: array of metrics corresponding to each statement in block in order
  throw new Error('Metric Aggregation for "' + this.name + '" and "Sequences" is not implemented!');
};

module.exports = AbstractMetric;