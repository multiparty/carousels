const carouselsTypes = require('../symbols/types.js');
const FunctionAbstraction = require('../symbols/functionAbstraction.js');
const Parameter = require('../symbols/parameter.js');

// visit children (except body)
const visitParametersAndReturn = function (analyzer, node, functionPathStr) {
  // add scope to all variable maps
  analyzer.variableTypeMap.addScope();
  analyzer.mapMetrics(function (metricTitle) {
    analyzer.variableMetricMap[metricTitle].addScope();
  });

  // visit parameters and store results in these arrays
  const parametersTypes = [];
  const parametersMetrics = [];
  for (let i = 0; i < node.parameters.length; i++) {
    const parameterResult = this.visit(node.parameters[i], functionPathStr + '@');
    parametersTypes.push(parameterResult.type);
    parametersMetrics.push(parameterResult.metrics);
  }

  // visit return type
  const returnTypeResult = this.visit(node.returnType, functionPathStr + '[returnType]');

  // return children results in a format that is suitable for the remaining computations
  return {
    types: {
      parameters: parametersTypes,
      returnType: returnTypeResult.type
    },
    metrics: analyzer.mapMetrics(function (metricTitle) {
      return {
        parameters: parametersMetrics.map(function (parameterMetric) {
          return parameterMetric[metricTitle];
        }),
        returnType: returnTypeResult.metrics[metricTitle]
      };
    })
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
  return function (metricTitle, metric) {
    const metricParameters = [];
    for (let i = 0; i < node.parameters.length; i++) {
      const metricParameter = Parameter.forMetric(functionPathStr + '@' + node.parameters[i].name.name, metricTitle);
      metricParameters.push(metricParameter);
      analyzer.variableMetricMap[metricTitle].add(node.parameters[i].name.name, metric.store(metricParameter));
    }

    const abstractionParameters = metricParameters.concat(parametersDependentParameters);
    const metricAbstraction = new FunctionAbstraction(node.name.name, metricTitle, abstractionParameters);
    analyzer.functionMetricAbstractionMap[metricTitle].add(node.name.name, metricAbstraction);
    analyzer.addParameters(metricParameters);

    analyzer.functionMetricAbstractionMap[metricTitle].addScope();
  };
};

// visit the body of the function, put the result in childrenTypes and childrenMetrics
const visitBody = function (analyzer, node, functionPathStr, childrenTypes, childrenMetrics) {
  const bodyResult = this.visit(node.body, functionPathStr + '#');
  childrenTypes['body'] = bodyResult.type;
  analyzer.mapMetrics(function (metricTitle) {
    childrenMetrics[metricTitle]['body'] = bodyResult.metrics[metricTitle]
  });
};

// If the return type had a dependent type/clause that was expressed via an abstraction
// find the closed form from the children (body) result and store it as the solution
// to that abstraction
const storeClosedFormReturnAbstraction = function (analyzer, functionName, functionType, childrenTypes) {
  if (functionType.returnType.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    const bodyType = childrenTypes['body'];

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
const storeClosedFormMetricAbstraction = function (analyzer, functionName, childrenMetrics) {
  return function (metricTitle) {
    const closedForm = childrenMetrics[metricTitle]['body'];
    const metricAbstraction = analyzer.functionMetricAbstractionMap[metricTitle].get(functionName);
    analyzer.abstractionToClosedFormMap[metricAbstraction.mathSymbol.toString()] = closedForm;
  };
};

// Visit Function Definition and analyze its type and metrics
// High level structures:
// 1. Visit parameters and return type declaration and build the function type
// 2. Add symbolic parameters representing any dependent type clause for the function parameters, as well as
//    symbolic parameters for the metrics of the function parameters.
// 3. Create function abstraction expressing the dependent type clause for the function return type (if it exists), as
//    well as abstraction for the metric of the function body. store abstractions in appropriate maps.
// 4. Visit body of the function: recursive use of the function is analyzed via the abstraction created above.
// 5. Take the values resulting from visiting the body, and use them as closed form solution to the abstractions
//    created above. Store these solutions in an appropriate map.
// 6. Aggregate metrics using the metric object, and return the final result.
const FunctionDefinition = function (node, pathStr) {
  const analyzer = this.analyzer;

  // Read some function attributes
  const functionName = node.name.name;
  const functionPathStr = pathStr + functionName;

  const childrenResult = visitParametersAndReturn.call(this, analyzer, node, functionPathStr);
  const childrenTypes = childrenResult.types;
  const childrenMetrics = childrenResult.metrics;

  // Create the function type
  const functionType = new carouselsTypes.FunctionType(null, childrenTypes.parameters, childrenTypes.returnType);
  const parametersDependentParameters = analyzer.getParametersBySymbol(functionType.getDependentParameters());

  analyzer.functionTypeMap.add(functionName, functionType);
  analyzer.functionTypeMap.addScope();

  // Create return abstraction
  createDependentReturnAbstraction(analyzer, functionName, functionType, parametersDependentParameters);

  // Create metric abstractions for this function
  // e.g. a function g(a: array<length:l>, b: number) => * has
  // number of round = G_rounds(rounds(a), rounds(b), length(a))
  // Map variables to their corresponding metric parameter (a => rounds(a))
  analyzer.mapMetrics(createMetricAbstraction(analyzer, node, functionPathStr, parametersDependentParameters));

  // Now we have:
  // 1. the function type including all its parameters and return type
  // 2. any symbolic parameters for dependent types of function parameters or return
  // 3. added bindings of all function parameters to the scope for types and metrics
  // 4. metrics and dependent return type abstractions for this function, bound to the scope
  // 5. all scoped maps updated with fresh new scope
  // We are ready to visit the function body
  visitBody.call(this, analyzer, node, functionPathStr, childrenTypes, childrenMetrics);

  // The function definition is over, remove its scope
  analyzer.removeScope();

  // Figure out the closed form symbolic equation for any dependent return type
  storeClosedFormReturnAbstraction(analyzer, functionName, functionType, childrenTypes);

  // Figure out the closed form symbolic equation for metrics
  analyzer.mapMetrics(storeClosedFormMetricAbstraction(analyzer, functionName, childrenMetrics));

  // Finally, return results
  return {
    type: functionType,
    metrics: analyzer.mapMetrics(function (metricTitle, metric) {
      // this is really just a fancy way of saying 0 ...
      return metric.aggregateFunctionDefinition(node, childrenTypes, childrenMetrics[metricTitle]);
    })
  };
};

// exports
module.exports = {
  FunctionDefinition: FunctionDefinition
};