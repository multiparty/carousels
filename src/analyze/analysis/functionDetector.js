// Detects function definitions in a given sequence of code (only at the top the level)
// Computes the function types and abstractions for each function.
const IRVisitor = require('../../ir/visitor.js');

const carouselsTypes = require('./../symbols/types.js');
const abstractions = require('./../symbols/abstractions.js');
const Parameter = require('../symbols/parameter.js');

// Single Scope Map
function SingleScopeMap() {
  this.map = {};
}
SingleScopeMap.prototype.add = function (key, val) {
  this.map[key] = val;
};
SingleScopeMap.prototype.get = function (key) {
  const result = this.map[key];
  if (result === undefined) {
    throw new Error('Cannot find "' + key + '" in SingleScopeMap');
  }
  return result;
};
SingleScopeMap.prototype.putIntoScopeMap = function (scopedMap) {
  for (let key in this.map) {
    if (Object.prototype.hasOwnProperty.call(this.map, key)) {
      scopedMap.add(key, this.map[key]);
    }
  }
};

// Create a new FunctionDetector
function FunctionDetector(analyzer) {
  IRVisitor.call(this);

  // Use this to access parameters and metric. We will not modify its scoped maps directly.
  this.analyzer = analyzer;

  // Mimics analyzer but for a single scope
  this.functionTypeMap = new SingleScopeMap();
  this.variableTypeMap = {};
  this.variableMetricMap = {};
  this.functionReturnAbstractionMap = new SingleScopeMap();
  this.functionMetricAbstractionMap = new SingleScopeMap();

  // Used to store local traversal history / intermediate result
  // This is then combined into the history of the main analyzer to properly stringify for debugging
  this.intermediateResults = {};
}

// Inherit IRVisitor
FunctionDetector.prototype = Object.create(IRVisitor.prototype);

// External API used by the main analyzer
FunctionDetector.prototype.putFunctionsInScope = function () {
  this.functionTypeMap.putIntoScopeMap(this.analyzer.variableTypeMap);
  this.functionReturnAbstractionMap.putIntoScopeMap(this.analyzer.functionReturnAbstractionMap);
  this.functionMetricAbstractionMap.putIntoScopeMap(this.analyzer.functionMetricAbstractionMap);
};
FunctionDetector.prototype.putParametersIntoScope = function (functionName) {
  this.variableTypeMap[functionName].putIntoScopeMap(this.analyzer.variableTypeMap);
  this.variableMetricMap[functionName].putIntoScopeMap(this.analyzer.variableMetricMap);
  this.putIntermediateResultsInHistory(functionName);
};
FunctionDetector.prototype.putIntermediateResultsInHistory = function (functionName) {
  this.analyzer.intermediateResults = this.analyzer.intermediateResults.concat(this.intermediateResults[functionName]);
};

// surround visit with a try catch
FunctionDetector.prototype.visit = function (node) {
  try {
    return IRVisitor.prototype.visit.apply(this, arguments);
  } catch (error) {
    if (error.__IRNODE == null) {
      error.__IRNODE = node;
    }
    throw error;
  }
};

// Visitors used for typing parameters and return type
FunctionDetector.prototype.visitTypeNode = function (node, pathStr) {
  if (node.type == null || node.type === '') {
    node.type = 'number';
  }

  const typeResult = carouselsTypes.fromTypeNode(node, pathStr);

  this.analyzer.addParameters(typeResult.parameters);
  this.intermediateResults[this.currentFunctionName].push({node: node, result: {type: typeResult.type, metric: this.analyzer.metric.initial}});

  return typeResult.type;
};
FunctionDetector.prototype.visitVariableDefinition = function (node, pathStr) {
  const variableName = node.name.name;
  const variableType = this.visit(node.type, pathStr + variableName + '[type]');

  if (variableType == null) {
    throw new Error('Cannot determine type of variable "' + pathStr + variableName + '"');
  }

  // Create new symbolic metric parameter for this variable
  const metricParameter = Parameter.forMetric(pathStr + '@' + variableName, this.analyzer.metricTitle);
  this.currentParameters[variableName] = metricParameter.mathSymbol;
  this.analyzer.addParameters([metricParameter]);

  // Update Scoped Maps
  this.variableTypeMap[this.currentFunctionName].add(variableName, variableType);
  this.variableMetricMap[this.currentFunctionName].add(variableName, this.analyzer.metric.store(metricParameter.mathSymbol));

  // Add intermediate result to traversal history
  this.intermediateResults[this.currentFunctionName].push({node: undefined, result: undefined});
  this.intermediateResults[this.currentFunctionName].push({node: node, result: {type: variableType, metric: metricParameter.mathSymbol}});

  // add variable and type to scope
  return variableType;
};

// visit children (except body)
FunctionDetector.prototype._typeParametersAndReturn = function (node, pathStr) {
  // visit parameters and store results in these arrays
  const parametersType = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersType.push(this.visit(node.parameters[i], pathStr + '@'));
  }

  // visit return type
  const returnType = this.visit(node.returnType, pathStr + '[returnType]');

  // return children results in a format that is suitable for the remaining computations
  return {
    parameters: parametersType,
    returnType: returnType
  };
};

// If return type has needs a dependent clause/parameter (e.g. it is an array and needs a length)
// then we must create an abstraction for it
// e.g. a function g(array<length:a>) => array<length:r> has abstraction
// r = G_return(a)
FunctionDetector.prototype._createDependentReturnAbstraction = function (functionName, functionType, functionParameters) {
  if (functionType.dependentType.returnType.is(carouselsTypes.ENUM.ARRAY)) {
    const returnAbstraction = new abstractions.FunctionAbstraction(this.analyzer, functionName, 'Return', functionParameters);
    this.functionReturnAbstractionMap.add(functionName, returnAbstraction);
  }
};

// Similar to dependent return abstraction, but for every metric
FunctionDetector.prototype._createMetricAbstraction = function (node, pathStr, functionParameters) {
  let metricParameters = [];
  for (let i = 0; i < node.parameters.length; i++) {
    metricParameters.push(this.currentParameters[node.parameters[i].name.name]);
  }

  const abstractionParameters = metricParameters.concat(functionParameters);
  const metricAbstraction = new abstractions.FunctionAbstraction(this.analyzer, node.name.name, this.analyzer.metricTitle, abstractionParameters);
  this.functionMetricAbstractionMap.add(node.name.name, metricAbstraction);
};

// Function Definition
FunctionDetector.prototype.visitFunctionDefinition = function (node, pathStr) {
  // Read some function attributes
  const functionName = node.name.name;
  this.currentFunctionName = functionName;
  pathStr += functionName;

  // Create single scopes for this function
  this.variableTypeMap[functionName] = new SingleScopeMap();
  this.variableMetricMap[functionName] = new SingleScopeMap();
  this.intermediateResults[functionName] = [];
  this.currentParameters = {};

  // Find the type of parameters and return value
  const childrenType = this._typeParametersAndReturn(node, pathStr);

  // Create the function type
  const functionType = new carouselsTypes.FunctionType(null, childrenType.parameters, childrenType.returnType);
  this.functionTypeMap.add(functionName, functionType);

  // Create return abstraction
  this._createDependentReturnAbstraction(functionName, functionType, childrenType.parameters);

  // Create metric abstraction for this function
  // e.g. a function g(a: array<length:l>, b: number) => * has
  // number of round = G_rounds(rounds(a), rounds(b), length(a))
  // Map variables to their corresponding metric parameter (a => rounds(a))
  this._createMetricAbstraction(node, pathStr, childrenType.parameters);
};

// Visit sequence: just look for function definition and visit those!
FunctionDetector.prototype.visitSequence = function (nodes, pathStr) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeType === 'FunctionDefinition') {
      this.visit(nodes[i], pathStr + '['+ i + ']');
    }
  }
};

module.exports = FunctionDetector;