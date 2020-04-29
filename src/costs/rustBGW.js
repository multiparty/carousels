// helpers to simplify expressing costs
const metrics = ['Network Bits', 'Network Rounds', 'Logical Gates', 'Total Memory', 'Memory Access', 'CPU'];

// raw costs
const primitiveCosts = require('./protocols/bgw/primitives.js');
const arithmeticCosts = require('./protocols/generic/arithmetic.js')(metrics, primitiveCosts);
const floatCosts = require('./protocols/generic/float.js')(metrics, primitiveCosts, arithmeticCosts);
const matrixCosts = require('./protocols/generic/matrix.js')(metrics, floatCosts);

// rules applying costs to regular expressions
const arithmeticRules = require('./rules/arithmetic.js');
const booleanRules = require('./rules/boolean.js');
const relationalRules = require('./rules/relational.js');
const arraysRules = require('./rules/arrays.js');
const floatRules = require('./rules/float.js');
const matrixRules = require('./rules/matrix.js');

// costs
module.exports = {
  parameters: [
    {symbol: 'b', description: 'the size of the field, also the security parameter'},
    {symbol: 'p', description: 'the number of parties'},
  ],
  metrics: [
    {
      title: 'Network Bits',
      description: 'Total number of bits sent by a party',
      type: 'TotalMetric'
    },
    {
      title: 'Network Rounds',
      description: 'Number of network calls made by a party',
      type: 'RoundMetric'
    },
    {
      title: 'Logical Gates',
      description: 'Total number of logical primitives',
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
      title: 'CPU',
      description: 'Estimated CPU cycles for a party',
      type: 'TotalMetric'
    }
  ],
  operations: arithmeticRules(metrics, primitiveCosts, arithmeticCosts)
    .concat(booleanRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(relationalRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(arraysRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(floatRules(metrics, floatCosts))
    .concat(matrixRules(metrics, matrixCosts))
};