const carouselsTypes = require('./types.js');
const math = require('../math.js');

let ABSTRACTION_COUNTER = 0;

// General abstraction class: a function symbol with parameters
function Abstraction(name, parameters, description) {
  this.name = name;
  this.description = description;
  this.parameters = parameters; // [Parameter]

  const parameterSymbols = this.parameters.map(function (parameter) {
    return parameter.mathSymbol.toString();
  });
  this.mathSymbol = math.parse(this.name + '(' + parameterSymbols.join(',') + ')');
}
Abstraction.prototype.concretize = function (concreteParameters) {
  return math.parse(this.name + '(' + concreteParameters.join(',') + ')');
};
Abstraction.prototype.toString = function () {
  const mathSymbol = this.mathSymbol.toString().trim();
  let ws = new Array(mathSymbol.length + 2);
  ws = ws.fill(' ').join('');

  let str = mathSymbol + ': ' + this.description;
  str += '\n' + ws + this.parameters.join('\n' + ws);
  return str;
};

// Abstraction for Functions
function FunctionAbstraction(analyzer, functionName, abstractionTitle, parameters) {
  this.functionName = functionName;

  const description = abstractionTitle + ' Abstraction for function "' + functionName + '"';
  const name = 'F' + (ABSTRACTION_COUNTER++);

  // store the parameters (and their indices in the function definition) that
  // have dependent types (arrays with lengths)
  this.parameterIndices = [];
  const parameterSymbols = [];
  for (let i = 0; i < parameters.length; i++) {
    let parameter = parameters[i];
    if (!parameter.isNode) { // not a mathjs symbol/expression
      parameter = getParameterDependentParameter(parameter);

      // not a dependent parameter
      if (parameter == null) {
        continue;
      }
    }

    this.parameterIndices.push(i);
    parameterSymbols.push(parameter);
  }

  Abstraction.call(this, name, analyzer.getParametersBySymbol(parameterSymbols), description);
}
// inherit prototype
FunctionAbstraction.prototype = Object.create(Abstraction.prototype);
FunctionAbstraction.prototype.concretize = function (parameters) {
  let concreteParams = [];
  for (let i = 0; i < this.parameterIndices.length; i++) {
    const index = this.parameterIndices[i];
    const parameterType = parameters[index];

    // Metric parameters are passed as mathjs expressions directly
    if (parameterType.isNode) {
      concreteParams.push(parameterType);
      continue;
    }

    // Expects an array parameter with some length (symbolic or valued)
    const dependentParameter = getParameterDependentParameter(parameterType);
    if (dependentParameter == null) {
      throw new Error('Function "' + this.functionName + '" called with non-dependent argument "' + parameterType.toString() + '" at position ' + index);
    }
    concreteParams.push(dependentParameter);
  }
  return Abstraction.prototype.concretize.call(this, concreteParams);
};
// helper for function abstraction
const getParameterDependentParameter = function (parameterType) {
  if (parameterType.is(carouselsTypes.ENUM.ARRAY)) {
    return parameterType.dependentType.length;
  } else if (parameterType.is(carouselsTypes.ENUM.NUMBER) || parameterType.is(carouselsTypes.ENUM.BOOLEAN)) {
    return parameterType.dependentType.value;
  } else {
    return null;
  }
};

// Abstraction for loops
function LoopAbstraction () {

}

module.exports = {
  FunctionAbstraction: FunctionAbstraction,
  LoopAbstraction: LoopAbstraction
};