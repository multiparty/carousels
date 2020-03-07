const carouselsTypes = require('./types.js');
const math = require('../math.js');

let ABSTRACTION_COUNTER = 0;

// parameters: array of Parameter objects corresponding to each parameter of the function in order
// function parameters that have no parameter can be left as null to avoid cluttering
function FunctionAbstraction(functionName, abstractionTitle, parameters) {
  this.functionName = functionName;
  this.abstractionTitle = abstractionTitle;

  this.id = ABSTRACTION_COUNTER++;
  this.abstractionName = 'F' + this.id;

  // store the parameters (and their indices in the function definition) that
  // have dependent types (arrays with lengths)
  this.parameters = [];
  this.parameterIndices = [];

  for (let i = 0; i < parameters.length; i++) {
    if (parameters[i] != null) {
      this.parameters.push(parameters[i]);
      this.parameterIndices.push(i);
    }
  }

  // function symbol
  const parameterSymbols = this.parameters.map(function (parameter) {
    return parameter.mathSymbol;
  });
  this.mathSymbol = math.parse(this.abstractionName + '(' + parameterSymbols.join(',') + ')');
}

// Concrete Symbol: specialized to the given parameters used at this invocation
FunctionAbstraction.prototype.concretize = function (concreteParams) {
  return math.parse(this.abstractionName + '(' + concreteParams.join(',') + ')');
};

FunctionAbstraction.prototype.concretizeDependent = function (parameters, metrics) {
  let concreteParams = [];

  metrics = metrics ? metrics : [];
  for (let i = 0; i < metrics.length; i++) {
    concreteParams.push(metrics[i]);
  }

  for (let i = 0; i < this.parameterIndices; i++) {
    const index = this.parameterIndices[i];
    const parameterType = parameters[index];

    // Expects an array parameter with some length (symbolic or valued)
    if (parameterType.is(carouselsTypes.TYPE_ENUM.ARRAY) && parameterType.hasDependentType('length')) {
      concreteParams.push(parameterType.dependentType.length);
    } else if (parameterType.hasDependentType('value')) {
      concreteParams.push(parameterType.dependentType.value);
    } else {
      throw new Error('Function "' + this.functionName + '" called with non-dependent argument "' + parameterType.toString() + '" at position ' + index);
    }
  }

  return this.concretize(concreteParams);
};

FunctionAbstraction.prototype.toString = function () {
  return '<Abstraction ' + this.mathSymbol.toString() + ': ' + (this.abstractionTitle + '\n' +
    this.parameters.join('\n')).trim() + '>';
};

module.exports = FunctionAbstraction;