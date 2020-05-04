const AbstractMetric = require('../../ir/metric.js');
const IR_NODES = require('../../ir/ir.js');
const math = require('../math.js');

const roundMetric = require('./round.js');
const totalMetric = require('./total.js');

// Round metric: aggregates cost along paths in the code dependency graph (through the depth of the circuit)
// Singleton object instantiated from AbstractMetric
function MixedMetric(roundCount, totalCount, addCostHook) {
  AbstractMetric.call(this, 'MixedMetric');
  this.roundCount = roundCount;
  this.totalCount = totalCount;
  this.addCostHook = addCostHook;

  this.initial = [];
  for (let i = 0; i < this.roundCount; i++) {
    this.initial.push(roundMetric.initial);
  }
  for (let i = 0; i < this.totalCount; i++) {
    this.initial.push(totalMetric.initial);
  }
}
MixedMetric.prototype = Object.create(AbstractMetric.prototype);

// extracts round/total metric from all pairs
const extract = function (nodeType, object, index) {
  const extracted = {};
  let func = null;
  let call = null;

  switch (nodeType) {
    case 'NameExpression':
      return object[index];

    case 'DirectExpression':
      return {
        operands: object.operands.map(function (val) {
          return val[index];
        })
      };

    case 'Sequence':
      return object.map(function (val) {
        return val[index];
      });

    case 'FunctionCall':
      if (object.function) {
        func = object.function[index];
      }
      if (object.call) {
        func = math.arrayAccess(object.call, index);
      }

      return {
        call: call,
        function: func,
        parameters: object.parameters.map(function (val) {
          return val[index];
        })
      };

    case 'ForEach':
      extracted.previousIterationMetric = math.arrayAccess(object.previousIterationMetric, index);
      extracted.body = object.body[index];
      extracted.iterator = object.iterator[index];
      extracted.range = object.range[index];
      return extracted;

    default:
      for (let key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          if (object[key] != null && object[key][index] != null) {
            extracted[key] = object[key][index];
          }
        }
      }
      return extracted;
  }
};

// apply roundMetric to round portion and totalMetric to total portion
MixedMetric.prototype.defaultAggregate =  function (node, childrenTypes, childrenMetric) {
  const result = [];

  for (let i = 0; i < this.roundCount; i++) {
    const rounds = extract(node.nodeType, childrenMetric, i);
    result.push(roundMetric['aggregate' + node.nodeType](node, childrenTypes, rounds));
  }

  for (let i = this.roundCount; i < this.roundCount + this.totalCount; i++) {
    const totals = extract(node.nodeType, childrenMetric, i);
    result.push(totalMetric['aggregate' + node.nodeType](node, childrenTypes, totals));
  }

  return result;
};
for (let i = 0; i < IR_NODES.length; i++) {
  const nodeType = IR_NODES[i];
  MixedMetric.prototype['aggregate'+nodeType] = MixedMetric.prototype.defaultAggregate;
}

// apply the same for sequences
MixedMetric.prototype.aggregateSequence = function (node, childrenTypes, childrenMetric) {
  const result = [];

  for (let i = 0; i < this.roundCount; i++) {
    const rounds = extract('Sequence', childrenMetric, i);
    result.push(roundMetric.aggregateSequence(node, childrenTypes, rounds));
  }

  for (let i = this.roundCount; i < this.roundCount + this.totalCount; i++) {
    const totals = extract('Sequence', childrenMetric, i);
    result.push(totalMetric.aggregateSequence(node, childrenTypes, totals));
  }

  return result;
};

// Override generic combinators
MixedMetric.prototype.store = function (metric) {
  if (this.roundCount === 0) {
    return totalMetric.initial;
  }

  if (this.roundCount === 1) {
    return roundMetric.store(Array.isArray(metric) ? metric[0] : metric);
  }

  throw new Error('Mixed Metric can only support at most a single round metric!');
};
MixedMetric.prototype.load = function (metric) {
  if (this.roundCount > 1) {
    throw new Error('Mixed Metric can only support at most a single round metric!');
  }

  const result = [];
  for (let i = 0; i < this.roundCount; i++) {
    result.push(roundMetric.load(metric));
  }
  for (let i = 0; i < this.totalCount; i++) {
    result.push(totalMetric.load(metric));
  }

  return result;
};
MixedMetric.prototype.addCost = function (metric, cost) {
  const result = [];
  for (let i = 0; i < this.roundCount; i++) {
    result.push(roundMetric.addCost(metric[i], cost[i]));
  }
  for (let i = this.roundCount; i < this.roundCount + this.totalCount; i++) {
    result.push(totalMetric.addCost(metric[i], cost[i]));
  }

  if (this.addCostHook) {
    return this.addCostHook(result);
  }
  return result;
};
MixedMetric.prototype.finalizeLoopAbstraction = function (abstractionCall) {
  const result = [];
  for (let i = 0; i < this.roundCount + this.totalCount; i++) {
    result.push(math.arrayAccess(abstractionCall, i));
  }
  return result;
};

module.exports = MixedMetric;