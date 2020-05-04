const math = require('../../../analyze/math.js');

const bootstrapCost = math.parse('100');
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