// helpers to simplify expressing costs
const metrics = ['Network Bits', 'Garbled Gates', 'Total Memory', 'Memory Access', 'CPU Garbler', 'CPU Evaluator'];

// All the primitive costs
const allCosts = require('./protocols/gc/gc.js')(metrics);
const floatCosts = require('./protocols/generic/float.js')(metrics, allCosts, allCosts);

// rules applying costs to regular expressions
const arithmeticRules = require('./rules/arithmetic.js');
const booleanRules = require('./rules/boolean.js');
const relationalRules = require('./rules/relational.js');
const arraysRules = require('./rules/arrays.js');
const floatRules = require('./rules/float.js');

// costs
module.exports = {
  parameters: [
    {symbol: 'b', description: 'input size in bits (of a single input: i.e. size of a number)'},
    {symbol: 's', description: 'security parameter (lambda)'},
    {symbol: 'RNG', description: 'CPU Cycle costs for RNG(s)'},
    {symbol: 'AES', description: 'CPU Cycle costs for AES(s)'}
  ],
  metrics: [
    {
      title: 'Network Bits',
      description: 'Total number of bits sent by both parties',
      type: 'TotalMetric'
    },
    {
      title: 'Garbled Gates',
      description: 'Total number of garbled gates in the resulting circuit',
      type: 'TotalMetric'
    },
    {
      title: 'Total Memory',
      description: 'Total number of bits stored in memory through all of the execution',
      type: 'TotalMetric'
    },
    {
      title: 'Memory Access',
      description: 'How many times memory was accessed',
      type: 'TotalMetric'
    },
    {
      title: 'CPU Garbler',
      description: 'Estimated CPU cycles for garbler',
      type: 'TotalMetric'
    },
    {
      title: 'CPU Evaluator',
      description: 'Estimated CPU cycles for evaluator',
      type: 'TotalMetric'
    }
  ],
  operations: arithmeticRules(metrics, allCosts, allCosts)
    .concat(booleanRules(metrics, allCosts, allCosts))
    .concat(relationalRules(metrics, allCosts, allCosts))
    .concat(arraysRules(metrics, allCosts, allCosts))
    .concat(floatRules(metrics, floatCosts))
};