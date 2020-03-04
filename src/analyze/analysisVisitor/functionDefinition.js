const carouselsTypes = require('../symbols/types.js');
const FunctionAbstraction = require('../symbols/functionAbstraction.js');
const Parameter = require('../symbols/parameter.js');

const removeScope = function () {
  this.analyzer.variableTypeMap.removeScope();
  this.analyzer.functionTypeMap.removeScope();
  this.analyzer.functionReturnAbstractionMap.removeScope();
  this.analyzer.variableMetricMap.removeScope();
  this.analyzer.functionMetricAbstractionMap.removeScope();
};

// visit children (except body)
const visitParametersAndReturn = function (analyzer, node, functionPathStr) {
  // add scope to all variable maps
  analyzer.variableTypeMap.addScope();
  analyzer.variableMetricMap.addScope();

  // visit parameters and store results in these arrays
  const parametersType = [];
  const parametersMetric = [];
  for (let i = 0; i < node.parameters.length; i++) {
    const parameterResult = this.visit(node.parameters[i], functionPathStr + '@');
    parametersType.push(parameterResult.type);
    parametersMetric.push(parameterResult.metric);
  }

  // visit return type
  const returnTypeResult = this.visit(node.returnType, functionPathStr + '[returnType]');

  // return children results in a format that is suitable for the remaining computations
  return {
    type: {
      parameters: parametersType,
      returnType: returnTypeResult.type
    },
    metric: {
      parameters: parametersMetric,
      returnType: returnTypeResult.metric
    }
  };
};

// If return type has needs a dependent clause/parameter (e.g. it is an array and needs a length)
// then we must create an abstraction for it
// e.g. a function g(array<length:a>) => array<length:r> has abstraction
// r = G_return(a)
const createDependentReturnAbstraction = function (analyzer, functionName, functionType, parametersDependentParameters) {
  if (functionType.returnType.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    const returnAbstraction = new FunctionAbstraction(functionName, 'returnAbstraction', parametersDependentParameters);
    analyzer.functionReturnAbstractionMap.add(functionName, returnAbstraction);
  }
  analyzer.functionReturnAbstractionMap.addScope();
};

// Similar to dependent return abstraction, but for every metric
const createMetricAbstraction = function (analyzer, node, functionPathStr, parametersDependentParameters) {
  const metricParameters = [];
  for (let i = 0; i < node.parameters.length; i++) {
    const metricParameter = Parameter.forMetric(functionPathStr + '@' + node.parameters[i].name.name, analyzer.metricTitle);
    metricParameters.push(metricParameter);
    analyzer.variableMetricMap.add(node.parameters[i].name.name, analyzer.metric.store(metricParameter));
  }

  const abstractionParameters = metricParameters.concat(parametersDependentParameters);
  const metricAbstraction = new FunctionAbstraction(node.name.name, analyzer.metricTitle, abstractionParameters);
  analyzer.functionMetricAbstractionMap.add(node.name.name, metricAbstraction);
  analyzer.addParameters(metricParameters);

  analyzer.functionMetricAbstractionMap.addScope();
};

// visit the body of the function, put the result in childrenType and childrenMetric
const visitBody = function (analyzer, node, functionPathStr, childrenType, childrenMetric) {
  const bodyResult = this.visit(node.body, functionPathStr + '#');
  childrenType['body'] = bodyResult.type;
  childrenMetric['body'] = bodyResult.metric;
};

// If the return type had a dependent type/clause that was expressed via an abstraction
// find the closed form from the children (body) result and store it as the solution
// to that abstraction
const storeClosedFormReturnAbstraction = function (analyzer, functionName, functionType, childrenType) {
  if (functionType.returnType.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    const bodyType = childrenType['body'];

    let concreteDependentReturnType;
    if (bodyType.is(carouselsTypes.TYPE_ENUM.ARRAY) && bodyType.hasDependentType('length')) {
      concreteDependentReturnType = bodyType.dependentType.length;
    } else {
      concreteDependentReturnType = functionType.returnType.dependentType.length;
    }

    const returnAbstraction = analyzer.functionReturnAbstractionMap.get(functionName);
    analyzer.abstractionToClosedFormMap[returnAbstraction.mathSymbol.toString()] = concreteDependentReturnType;
  }
};

// Store the closed form metric equation return from visiting the body as the solution
// to the corresponding metric abstraction
const storeClosedFormMetricAbstraction = function (analyzer, functionName, bodyMetric) {
  const metricAbstraction = analyzer.functionMetricAbstractionMap.get(functionName);
  analyzer.abstractionToClosedFormMap[metricAbstraction.mathSymbol.toString()] = bodyMetric;
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

  // Read some function attributes
  const functionName = node.name.name;
  const functionPathStr = pathStr + functionName;

  const childrenResult = visitParametersAndReturn.call(this, analyzer, node, functionPathStr);
  const childrenType = childrenResult.type;
  const childrenMetric = childrenResult.metric;

  // Create the function type
  const functionType = new carouselsTypes.FunctionType(null, childrenType.parameters, childrenType.returnType);
  const parametersDependentParameters = analyzer.getParametersBySymbol(functionType.getDependentParameters());

  analyzer.functionTypeMap.add(functionName, functionType);
  analyzer.functionTypeMap.addScope();

  // Create return abstraction
  createDependentReturnAbstraction(analyzer, functionName, functionType, parametersDependentParameters);

  // Create metric abstraction for this function
  // e.g. a function g(a: array<length:l>, b: number) => * has
  // number of round = G_rounds(rounds(a), rounds(b), length(a))
  // Map variables to their corresponding metric parameter (a => rounds(a))
  createMetricAbstraction(analyzer, node, functionPathStr, parametersDependentParameters);

  // Now we have:
  // 1. the function type including all its parameters and return type
  // 2. any symbolic parameters for dependent types of function parameters or return
  // 3. added bindings of all function parameters to the scope for types and metric
  // 4. metric and dependent return type abstractions for this function, bound to the scope
  // 5. all scoped maps updated with fresh new scope
  // We are ready to visit the function body
  visitBody.call(this, analyzer, node, functionPathStr, childrenType, childrenMetric);

  // The function definition is over, remove its scope
  removeScope.call(this);

  // Figure out the closed form symbolic equation for any dependent return type
  storeClosedFormReturnAbstraction(analyzer, functionName, functionType, childrenType);

  // Figure out the closed form symbolic equation for metric abstraction
  storeClosedFormMetricAbstraction(analyzer, functionName, childrenMetric['body']);

  // Finally, return results
  return {
    type: functionType,
    metric: analyzer.metric.aggregateFunctionDefinition(node, childrenType, childrenMetric)
  };
};

// exports
module.exports = {
  FunctionDefinition: FunctionDefinition
};