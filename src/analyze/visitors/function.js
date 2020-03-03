const carouselsTypes = require('../symbols/types.js');
const FunctionAbstraction = require('../symbols/functionAbstraction.js');
const Parameter = require('../symbols/parameter.js');

const FunctionDefinition = function (node, pathStr) {
  const analyzer = this.analyzer;

  // Read some function attributes
  const functionName = node.name.name;
  const functionPathStr = pathStr + functionName;

  // Create the function type
  const result = carouselsTypes.FunctionType.fromFunctionDefinitionNode(functionPathStr, node);
  const functionType = result.functionType;
  analyzer.addParameters(result.parameters);
  analyzer.functionTypeMap.add(functionName, functionType);

  // If return type has needs a dependent clause/parameter (e.g. it is an array)
  // then we must create an abstraction for it
  // e.g. a function g(array<length:a>) => array<length:r> has abstraction
  // r = G_return(a)
  if (functionType.returnType.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    const parametersDependentParameters = analyzer.getParametersBySymbol(functionType.getDependentParameters());
    const returnAbstraction = new FunctionAbstraction(functionName, 'returnAbstraction', parametersDependentParameters);
    analyzer.functionReturnAbstractionMap.add(functionName, returnAbstraction);
  }

  // Create metric abstractions for this function
  // e.g. a function g(array<length:a>) => * has
  // number of round = G_rounds(a)
  const metricsParameters = {};
  analyzer.mapMetrics(function (metricTitle) {
    metricsParameters[metricTitle] = [];
    for (let i = 0; i < node.parameters.length; i++) {
      const metricParameter = Parameter.forMetric(functionPathStr + '@' + node.parameters[i].name.name, metricTitle);
      metricsParameters[metricTitle].push(metricParameter);
    }

    const metricAbstraction = new FunctionAbstraction(functionName, metricTitle, metricsParameters[metricTitle]);
    analyzer.functionMetricAbstractionMap[metricTitle].add(functionName, metricAbstraction);
    analyzer.addParameters(metricsParameters[metricTitle]);
  });

  // Add a new scope for this function
  analyzer.addScope();

  // Add parameter bindings for the scope
  for (let i = 0; i < node.parameters.length; i++) {
    analyzer.variableTypeMap.add(node.parameters[i].name.name, functionType.parameterTypes[i]);
    analyzer.mapMetrics(function (metricTitle) {
      analyzer.variableMetricMap[metricTitle].add(node.parameters[i].name.name, metricsParameters[metricTitle][i]);
    });
  }

  // Now: we have the function type set up
  // We add bindings of all function parameters to the scope for types and metrics
  // Additionally, we added metrics and dependent return type abstractions for this function
  // We are ready to visit the function body
  const childrenResult = this.visit(node.body, functionPathStr + '#');

  // The function definition is over, remove its scope
  analyzer.removeScope();

  // Figure out the closed form symbolic equation for any dependent return type
  if (functionType.returnType.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    let concreteDependentReturnType;
    if (childrenResult.type.is(carouselsTypes.TYPE_ENUM.ARRAY) && childrenResult.type.hasDependentType('length')) {
      concreteDependentReturnType = childrenResult.type.dependentType.length;
    } else {
      concreteDependentReturnType = functionType.returnType.dependentType.length;
    }

    const returnAbstraction = analyzer.functionReturnAbstractionMap.get(functionName);
    analyzer.abstractionToClosedFormMap[returnAbstraction.mathSymbol.toString()] = concreteDependentReturnType;
  }

  const returnMetrics = {};
  // Figure out the closed form symbolic equation for metrics
  analyzer.mapMetrics(function (metricTitle, metric) {
    const closedForm = childrenResult.metrics[metricTitle];
    const metricAbstraction = analyzer.functionMetricAbstractionMap[metricTitle].get(functionName);
    analyzer.abstractionToClosedFormMap[metricAbstraction.mathSymbol.toString()] = closedForm;
    returnMetrics[metricTitle] = metric.initial;
  });

  // Finally, return results
  return {
    type: functionType,
    metrics: returnMetrics
  };
};

const ReturnStatement = function (node) {};

const FunctionCall = function (node) {};

module.exports = {
  FunctionDefinition: FunctionDefinition,
  ReturnStatement: ReturnStatement,
  FunctionCall: FunctionCall
};