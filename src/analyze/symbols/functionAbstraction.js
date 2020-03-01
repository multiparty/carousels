const carouselsTypes = require('./types.js');

let ABSTRACTION_COUNTER = 0;

function FunctionAbstraction(functionName, functionType) {
  this.functionName = functionName;

  this.id = ABSTRACTION_COUNTER++;
  this.abstractionName = 'f' + this.id;

  // store the parameters (and their indices in the function definition) that
  // have dependent types (arrays with lengths)
  this.parameters = [];
  this.parameterIndices = [];

  for (let i = 0; i < functionType.parameterTypes.length; i++) {
    const parameterType = functionType.parameterTypes[i];
    if (parameterType == null || parameterType.dataType !== carouselsTypes.TYPE_ENUM.ARRAY) {
      this.parameters.push(parameterType.dependentType.length);
      this.parameterIndices.push(i);
    }
  }
}

// Abstract Symbol: does not depend on invocation, only definition
FunctionAbstraction.prototype.symbol = function () {
  return this.abstractionName + '(' + this.parameters.join(',') + ')';
};

// Concrete Symbol: specialized to the given parameters used at this invocation
FunctionAbstraction.prototype.concretize = function (parameters) {
  let concreteParams = [];

  for (let i = 0; i < this.parameterIndices; i++) {
    const index = this.parameterIndices[i];
    const parameterType = parameters[index];

    // Expects an array parameter with some length (symbolic or valued)
    if (parameterType.dataType !== carouselsTypes.TYPE_ENUM.ARRAY || !parameterType.hasDependentType('length')) {
      throw new Error('Function "' + this.functionName + '" called with non-dependent argument "' + parameterType.toString() + '" at position ' + index);
    }

    concreteParams.push(parameterType.dependentType.length);
  }

  return this.abstractionName + '(' + concreteParams.join(',') + ')';
};