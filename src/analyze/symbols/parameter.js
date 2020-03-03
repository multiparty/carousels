const math = require('../math.js');

const USED_PARAMETERS = [];
let PARAMETER_COUNTER = 0;

function Parameter(symbol, description) {
  this.mathSymbol = math.parse(symbol);
  this.description = description;

  if (USED_PARAMETERS.indexOf(this.mathSymbol) > -1) {
    throw new Error('Parameter Symbol "' + this.mathSymbol + '" already used!');
  }
  USED_PARAMETERS.push(this.mathSymbol);
}

// static
Parameter.forArrayLength = function (arrayName) {
  const description = 'The size of array "' + arrayName + '"';
  const symbol = 'n' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.forNumberValue = function (variableName) {
  const description = 'The value of number variable "' + variableName + '"';
  const symbol = 'v' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.forMetric = function (variableName, metricName) {
  const description = 'The "' + metricName + '" metric for variable "' + variableName + '"';
  const symbol = 'm' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.prototype.toString = function () {
  return this.mathSymbol.toString() + ': ' + this.description;
};

module.exports = Parameter;