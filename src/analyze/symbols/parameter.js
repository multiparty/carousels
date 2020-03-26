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

Parameter.prototype.toString = function () {
  return this.mathSymbol.toString() + ': ' + this.description;
};

// static
Parameter.forArrayLength = function (arrayName) {
  const description = 'The size of array "' + arrayName + '"';
  const symbol = 'n' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.forValue = function (variableName) {
  const description = 'The value of variable "' + variableName + '"';
  const symbol = 'v' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.forMetric = function (variableName, metricTitle) {
  const description = 'The "' + metricTitle + '" metric for variable "' + variableName + '"';
  const symbol = 'm' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.forCondition = function (conditionPath) {
  const description = 'The value of condition "' + conditionPath + '"';
  const symbol = 'c' + (PARAMETER_COUNTER)++;
  return new Parameter(symbol, description);
};
Parameter.forLoop = function (loopName) {
  const description = 'The current iteration of the for loop "' + loopName + '"';
  const symbol = 'i' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};

module.exports = Parameter;