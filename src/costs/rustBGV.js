// helpers to simplify expressing costs
const metrics = ['RISK-V Instructions', 'Total Memory', 'Memory Access'];
// Rounds are always 2
// Network bits are the size of input and output ciphers
// formula for size of an input cipher: 2 * (D+1) * n * b
// formula for size of an output cipher: (2+L) * (D+1-L) * n * b, where L is the multiplication depth of
//     the output (can be found by looking at the first component of any of the metrics below)

// raw costs
const primitiveCosts = require('./protocols/bgv/primitives.js');
const arithmeticCosts = require('./protocols/bgv/arithmetic.js')(metrics, primitiveCosts);
const floatCosts = require('./protocols/bgv/float.js')(metrics, primitiveCosts, arithmeticCosts);
const matrixCosts = require('./protocols/bgv/matrix.js')(metrics, floatCosts);

// rules applying costs to regular expressions
const arithmeticRules = require('./rules/arithmetic.js');
const booleanRules = require('./rules/boolean.js');
const relationalRules = require('./rules/relational.js');
const arraysRules = require('./rules/arrays.js');
const floatRules = require('./rules/float.js');
const matrixRules = require('./rules/matrix.js');

// useful for tracking number of bootstraps
const bootstrapTracker = require('./protocols/bgv/bootstrapper.js');

// costs
module.exports = {
  parameters: [
    {symbol: 'n', description: 'ring dimension'},
    {symbol: 'D', description: 'number of multiplications before bootstrapping'},
    {symbol: 'NTT', description: 'cost of number theoretic transform'},
    {symbol: 'RA', description: 'cost of a ring vector addition'},
    {symbol: 'RM', description: 'cost of a ring vector multiplication'},
    {symbol: 'b', description: 'plaintext domain bit size'}
  ],
  metrics: [
    {
      title: 'RISK-V Instructions',
      description: 'Estimated RISK-V instructions per party',
      type: {
        name: 'MixedMetric',
        // current multiplication depth, total number of CPU instructions (without bootstraps), total number of bootstraps
        params: [1, 2, bootstrapTracker]
      }
    },
    {
      title: 'Total Memory',
      description: 'Total number of bits stored in memory through all of the execution',
      type: {
        name: 'MixedMetric',
        params: [1, 2, bootstrapTracker]
      }
    },
    {
      title: 'Memory Access',
      description: 'How many times memory was accessed',
      type: {
        name: 'MixedMetric',
        params: [1, 2, bootstrapTracker]
      }
    }
  ],
  operations: arithmeticRules(metrics, primitiveCosts, arithmeticCosts)
    .concat(booleanRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(relationalRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(arraysRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(floatRules(metrics, floatCosts))
    .concat(matrixRules(metrics, matrixCosts))
};