const math = require('../../../analyze/math.js');

// cost of a single bootstrap
const NTTCost = '(b + 10)*(b + 10)';
const RMCost = 'log(b + 10)*(b + 10)*(b + 10)*(b + 10)/2';
const bootstrapCost = math.parse('NTT * ' + NTTCost + ' + RM * ' + RMCost);

// max number of multiplication levels before bootstrapping
const D = math.parse('D');

module.exports = function (currentMetric) {
  const multiplicationDepth = currentMetric[0];
  const totalMetric = currentMetric[1];
  const bootstrapCount = currentMetric[2];

  const newDepth = math.mod(multiplicationDepth, D);
  const addedBootstraps = math.div(multiplicationDepth, D);
  const newBootstrapCount = math.add(bootstrapCount, addedBootstraps);
  const newTotal = math.add(totalMetric, math.multiply(addedBootstraps, bootstrapCost));
  return [newDepth, newTotal, newBootstrapCount];
};