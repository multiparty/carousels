const AbstractMetric = require('../../ir/metric.js');
const IR_NODES = require('../../ir/ir.js')
const math = require('../math.js');

const roundMetric = require('./round.js');
const totalMetric = require('./total.js');

// Round metric: aggregates cost along paths in the code dependency graph (through the depth of the circuit)
// Singleton object instantiated from AbstractMetric
const mixedMetric = new AbstractMetric('RoundMetric');

// metrics produced by mixedMetric are on the form of an array
// the first element represents the round metric
// the second is the total metric
mixedMetric.ROUND = 0;
mixedMetric.TOTAL = 1;

// initial
mixedMetric.initial = [roundMetric.initial, totalMetric.initial];

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
const defaultAggregate =  function (node, childrenTypes, childrenMetric) {
  const rounds = extract(node.nodeType, childrenMetric, mixedMetric.ROUND);
  const totals = extract(node.nodeType, childrenMetric, mixedMetric.TOTAL);

  return [
    roundMetric['aggregate' + node.nodeType](node, childrenTypes, rounds),
    totalMetric['aggregate' + node.nodeType](node, childrenTypes, totals)
  ];
};
for (let i = 0; i < IR_NODES.length; i++) {
  const nodeType = IR_NODES[i];
  mixedMetric['aggregate'+nodeType] = defaultAggregate;
}

mixedMetric.aggregateSequence = function (node, childrenTypes, childrenMetric) {
  const rounds = extract('Sequence', childrenMetric, mixedMetric.ROUND);
  const totals = extract('Sequence', childrenMetric, mixedMetric.TOTAL);

  return [
    roundMetric.aggregateSequence(node, childrenTypes, rounds),
    totalMetric.aggregateSequence(node, childrenTypes, totals)
  ];
};

// Override generic combinators
mixedMetric.store = function (metric) {
  if (Array.isArray(metric)) {
    return roundMetric.store(metric[mixedMetric.ROUND]);
  }

  return roundMetric.store(metric);
};
mixedMetric.load = function (metric) {
  return [roundMetric.load(metric), totalMetric.load(metric)];
};
mixedMetric.addCost = function (metric, cost) {
  return [
    roundMetric.addCost(metric[mixedMetric.ROUND], cost[mixedMetric.ROUND]),
    totalMetric.addCost(metric[mixedMetric.TOTAL], cost[mixedMetric.TOTAL])
  ];
};
mixedMetric.finalizeLoopAbstraction = function (abstractionCall) {
  return [
    math.arrayAccess(abstractionCall, 0),
    math.arrayAccess(abstractionCall, 1)
  ];
};

module.exports = mixedMetric;