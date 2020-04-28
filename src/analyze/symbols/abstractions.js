const carouselsTypes = require('./types.js');
const math = require('../math.js');

let ABSTRACTION_COUNTER = 0;

// General abstraction class: a function symbol with parameters
function Abstraction(name, scopeParameters, parameters, description) {
  this.name = name;
  this.description = description;
  this.scopeParameters = scopeParameters; // parameters that the parent abstractions receive and are in the scope of this abstraction
  this.parameters = parameters; // [Parameter]

  this.scopeParametersMath = [];
  this.scopeParameterValues = [];
  scopeParameters.forEach(function (parameter) {
    if (parameter.value) {
      this.scopeParametersMath.push(parameter.parameter.mathSymbol.toString());
      this.scopeParameterValues.push(parameter.parameter.mathSymbol.toString()); //parameter.value.toString());
    } else {
      this.scopeParametersMath.push(parameter.mathSymbol.toString());
      this.scopeParameterValues.push(parameter.mathSymbol.toString());
    }
  }, this);
  const parameterSymbols = this.parameters.map(function (parameter) {
    return parameter.mathSymbol.toString();
  });
  this.mathSymbol = math.parse(this.name + '(' + this.scopeParametersMath.concat(parameterSymbols).join(',') + ')');
}
Abstraction.prototype.concretize = function (concreteParameters) {
  return math.parse(this.name + '(' + this.scopeParameterValues.concat(concreteParameters).join(',') + ')');
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
function FunctionAbstraction(analyzer, functionName, abstractionTitle, scopeParameters, parameters) {
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

  Abstraction.call(this, name, scopeParameters, analyzer.getParametersBySymbol(parameterSymbols), description);
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
  } if (parameterType.is(carouselsTypes.ENUM.MATRIX)) {
    return parameterType.dependentType.rows; // only rows for now
  } else if (parameterType.is(carouselsTypes.ENUM.NUMBER) || parameterType.is(carouselsTypes.ENUM.BOOL) || parameterType.is(carouselsTypes.ENUM.FLOAT)) {
    return parameterType.dependentType.value;
  } else {
    return null;
  }
};

// Abstraction for loops
function LoopAbstraction(suffix, scopeParameters, iterationParameter, description) {
  Abstraction.call(this, 'L' + suffix, scopeParameters, [iterationParameter], description);
}
// inherit prototype
LoopAbstraction.prototype = Object.create(Abstraction.prototype);
// static function for creating all loopAbstractions for a given loop
LoopAbstraction.makeAbstractions = function (pathStr, metricTitle, scopeParameters, iterationParameter, variableNames, variableTypes) {
  const index = ABSTRACTION_COUNTER++;
  // metric abstraction for entire loop
  const metricLoopAbstraction = new LoopAbstraction(index, scopeParameters, iterationParameter, metricTitle + ' Abstraction for loop "' + pathStr + '"');

  // abstractions for every modified variable in the loop
  const abstractions = {
    metrics: {},
    types: {}
  };

  // construct abstraction for every variable
  for (let i = 0; i < variableNames.length; i++) {
    // the metric abstraction is always constructed
    const variableName = variableNames[i];
    const variableMetricAbstraction = new LoopAbstraction(index + variableName, scopeParameters, iterationParameter,
      metricTitle + ' Abstraction for variable "' + variableName + '" in loop "' + pathStr + '"');
    abstractions.metrics[variableName] = variableMetricAbstraction;

    // a type abstraction is only constructor for array lengths
    if (variableTypes[i].is(carouselsTypes.ENUM.ARRAY)) {
      const variableTypeAbstraction = new LoopAbstraction('t' + index + variableName, scopeParameters, iterationParameter,
        'Type Abstraction for variable "' + variableName + '" in loop "' + pathStr + '"');
      abstractions.types[variableName] = variableTypeAbstraction;
    }
  }

  // return all constructor abstractions
  return {
    loop: metricLoopAbstraction,
    variables: abstractions
  };
};

module.exports = {
  FunctionAbstraction: FunctionAbstraction,
  LoopAbstraction: LoopAbstraction
};