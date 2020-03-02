const USED_PARAMETERS = [];
let PARAMETER_COUNTER = 0;

function Parameter(symbol, description) {
  this.symbol = symbol;
  this.description = description;

  if (USED_PARAMETERS.indexOf(this.symbol) > -1) {
    throw new Error('Parameter Symbol "' + this.symbol + '" already used!');
  }
  this.USED_PARAMETERS.push(this.symbol);
}

// static
Parameter.forArrayLength = function (arrayName) {
  const description = 'The size of array "' + arrayName + '"';
  const symbol = 'n' + (PARAMETER_COUNTER++);
  return new Parameter(symbol, description);
};
Parameter.prototype.toString = function () {
  return this.symbol + ': ' + this.description;
};

module.exports = Parameter;