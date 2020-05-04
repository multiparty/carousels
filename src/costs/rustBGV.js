// helpers to simplify expressing costs
const metrics = ['CPU'];
// Rounds are always 2
// Network bits are the size of input and output ciphers

// raw costs
const primitiveCosts = require('./protocols/bgv/primitives.js');
const arithmeticCosts = require('./protocols/generic/arithmetic.js')(metrics, primitiveCosts);
// const floatCosts = require('./protocols/generic/float.js')(metrics, primitiveCosts, arithmeticCosts);
// const matrixCosts = require('./protocols/generic/matrix.js')(metrics, floatCosts);

// rules applying costs to regular expressions
const arithmeticRules = require('./rules/arithmetic.js');
// const booleanRules = require('./rules/boolean.js');
// const relationalRules = require('./rules/relational.js');
// const arraysRules = require('./rules/arrays.js');
// const floatRules = require('./rules/float.js');
// const matrixRules = require('./rules/matrix.js');

// costs
module.exports = {
  parameters: [
    {symbol: 'b', description: 'the size of the field, also the security parameter'},
    {symbol: 'p', description: 'the number of parties'},
    {symbol:' D', description: 'number of multiplications before bootstrapping'}
  ],
  metrics: [
    {
      title: 'CPU',
      description: 'Estimated RISK-V instructions per party',
      type: {
        name: 'MixedMetric',
        // current multiplication depth, total number of CPU instructions (without bootstraps), total number of bootstraps
        params: [1, 2]
      }
    }
  ],
  operations: arithmeticRules(metrics, primitiveCosts, arithmeticCosts)
  /*
    .concat(booleanRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(relationalRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(arraysRules(metrics, primitiveCosts, arithmeticCosts))
    .concat(floatRules(metrics, floatCosts))
    .concat(matrixRules(metrics, matrixCosts))
  */
};