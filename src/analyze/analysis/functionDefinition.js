const carouselsTypes = require('../symbols/types.js');

const addScope = function () {
  this.analyzer.variableTypeMap.addScope();
  this.analyzer.functionReturnAbstractionMap.addScope();
  this.analyzer.variableMetricMap.addScope();
  this.analyzer.functionMetricAbstractionMap.addScope();
};
const removeScope = function () {
  this.analyzer.variableTypeMap.removeScope();
  this.analyzer.functionReturnAbstractionMap.removeScope();
  this.analyzer.variableMetricMap.removeScope();
  this.analyzer.functionMetricAbstractionMap.removeScope();
};

// If the return type had a dependent type/clause that was expressed via an abstraction
// find the closed form from the children (body) result and store it as the solution
// to that abstraction
const storeClosedFormReturnAbstraction = function (analyzer, functionName, functionType, bodyType) {
  if (functionType.dependentType.returnType.is(carouselsTypes.ENUM.ARRAY)) {
    let concreteDependentReturnType;
    if (bodyType.is(carouselsTypes.ENUM.ARRAY)) {
      concreteDependentReturnType = bodyType.dependentType.length;
    } else {
      concreteDependentReturnType = functionType.dependentType.returnType.dependentType.length;
    }

    const returnAbstraction = analyzer.functionReturnAbstractionMap.get(functionName);
    analyzer.abstractionToClosedFormMap[returnAbstraction.mathSymbol.toString()] = concreteDependentReturnType;

    return returnAbstraction.mathSymbol.toString() + ' = ' + concreteDependentReturnType.toString();
  }

  return '';
};

// Store the closed form metric equation return from visiting the body as the solution
// to the corresponding metric abstraction
const storeClosedFormMetricAbstraction = function (analyzer, functionName, bodyMetric) {
  const metricAbstraction = analyzer.functionMetricAbstractionMap.get(functionName);
  analyzer.abstractionToClosedFormMap[metricAbstraction.mathSymbol.toString()] = bodyMetric;
  return metricAbstraction.mathSymbol.toString() + ' = ' + bodyMetric.toString();
};

// Visit Function Definition and analyze its type and metric
// High level structures:
// 1. Visit parameters and return type declaration and build the function type
// 2. Add symbolic parameters representing any dependent type clause for the function parameters, as well as
//    symbolic parameters for the metric of the function parameters.
// 3. Create function abstraction expressing the dependent type clause for the function return type (if it exists), as
//    well as abstraction for the metric of the function body. store abstractions in appropriate maps.
// 4. Visit body of the function: recursive use of the function is analyzed via the abstraction created above.
// 5. Take the values resulting from visiting the body, and use them as closed form solution to the abstractions
//    created above. Store these solutions in an appropriate map.
// 6. Aggregate metric using the metric object, and return the final result.
const FunctionDefinition = function (node, pathStr) {
  const analyzer = this.analyzer;

  // Add scopes for all scoped maps
  addScope.call(this);

  // Read some function attributes
  const functionName = node.name.name;
  pathStr = pathStr + functionName;

  // Get the previously detected function type (because of FunctionDetector)
  const functionType = analyzer.variableTypeMap.get(functionName);

  // Add previously handled function parameters to the scope
  this.currentFunctionDetector.putParametersIntoScope(functionName);

  // Now we have:
  // 1. the function type including all its parameters and return type
  // 2. any symbolic parameters for dependent types of function parameters or return
  // 3. added bindings of all function parameters to the scope for types and metric
  // 4. metric and dependent return type abstractions for this function, bound to the scope
  // 5. all scoped maps updated with fresh new scope
  // 6. intermediateResults/traversal history updated with history from FunctionDetector
  // We are ready to visit the function body
  const bodyResult = this.visit(node.body, pathStr + '#');

  // The function definition is over, remove its scope
  removeScope.call(this);

  // Figure out the closed form symbolic equation for any dependent return type
  const returnAbstractionStr = storeClosedFormReturnAbstraction(analyzer, functionName, functionType, bodyResult.type);

  // Figure out the closed form symbolic equation for metric abstraction
  const metricAbstractionStr = storeClosedFormMetricAbstraction(analyzer, functionName, bodyResult.metric);

  // Construct children type and metric maps for aggregation
  const childrenType = {
    parameters: [],
    returnType: functionType.dependentType.returnType,
    body: bodyResult.type
  };
  const childrenMetric = {
    parameters: [],
    returnType: analyzer.metric.initial,
    body: bodyResult.metric
  };

  for (let i = 0; i < node.parameters.length; i++) {
    childrenType.parameters[i] = functionType.dependentType.parameterTypes[i];
    childrenMetric.parameters[i] = analyzer.metric.initial;
  }

  // Aggregate metric
  const aggregateMetric = analyzer.metric.aggregateFunctionDefinition(node, childrenType, childrenMetric);

  // Finally, return results
  return {
    type: functionType,
    metric: aggregateMetric,
    // only for logging
    returnAbstraction: returnAbstractionStr,
    metricAbstraction: metricAbstractionStr
  };
};

// exports
module.exports = {
  FunctionDefinition: FunctionDefinition
};