const carouselsTypes = require('../symbols/types.js');
const TreeTracker = require('../symbols/treeTracker.js');

const math = require('../math.js');

// If the return type had a dependent type/clause that was expressed via an abstraction
// find the closed form from the children (body) result and store it as the solution
// to that abstraction
const storeClosedFormReturnAbstraction = function (analyzer, functionName, functionType, bodyType) {
  if (functionType.dependentType.returnType.is(carouselsTypes.ENUM.ARRAY)) {
    if (!bodyType.is(carouselsTypes.ENUM.ARRAY)) {
      throw new Error('Function "' + functionName + '" body returns type "' + bodyType + '" that does not matching the signature!');
    }

    let finalDependentReturnType = bodyType.dependentType.length;
    const earlyReturnConditions = analyzer.functionReturnConditionMap[functionName];
    for (let i = earlyReturnConditions.length - 1; i >= 0; i--) {
      const earlyReturn = earlyReturnConditions[i];
      const earlyType = earlyReturn.type;
      if (!earlyType.is(carouselsTypes.ENUM.ARRAY)) {
        throw new Error('Function "' + functionName + '" body returns type "' + earlyType + '" at conditions "' +
          earlyReturn.condition + '" that does not matching the signature!');
      }
      finalDependentReturnType = math.iff(earlyReturn.condition, earlyType.dependentType.length, finalDependentReturnType);
    }

    const returnAbstraction = analyzer.functionReturnAbstractionMap.get(functionName);
    analyzer.abstractionToClosedFormMap[returnAbstraction.mathSymbol.toString()] = finalDependentReturnType;

    return returnAbstraction.mathSymbol.toString() + ' = ' + finalDependentReturnType.toString();
  }

  return '';
};

// Store the closed form metric equation return from visiting the body as the solution
// to the corresponding metric abstraction
const storeClosedFormMetricAbstraction = function (analyzer, functionName, bodyMetric) {
  // accumulate bodyMetric into all recorded earlyReturn results
  const earlyReturnConditions = analyzer.functionReturnConditionMap[functionName];
  let finalMetric = bodyMetric;
  for (let i = earlyReturnConditions.length - 1; i >= 0; i--) {
    const earlyReturn = earlyReturnConditions[i];
    finalMetric = math.iff(earlyReturn.condition, earlyReturn.metric, finalMetric, true);
  }

  // store resulting closed form
  const metricAbstraction = analyzer.functionMetricAbstractionMap.get(functionName);
  analyzer.abstractionToClosedFormMap[metricAbstraction.mathSymbol.toString()] = finalMetric;
  return metricAbstraction.mathSymbol.toString() + ' = ' + finalMetric.toString();
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
  analyzer.addScope();

  // Read some function attributes
  const functionName = node.name.name;
  pathStr = pathStr + functionName;

  // Get the previously detected function type (because of FunctionDetector)
  const functionType = analyzer.variableTypeMap.get(functionName);

  // Add previously handled function parameters to the scope
  this.currentFunctionDetector.putParametersIntoScope(functionName);

  // Add all the parameters that the function abstraction expects to the path tracker
  // so that nested abstractions in the body can access them
  const metricAbstraction = analyzer.functionMetricAbstractionMap.get(functionName);
  this.analyzer.parametersPathTracker.concat(metricAbstraction.parameters);

  // mark that we are in this function
  const oldFunctionName = analyzer.currentFunctionName;
  analyzer.currentFunctionName = functionName;

  // for pretty printing later
  if (analyzer.functionLoopAbstractionMap[functionName] != null) {
    throw new Error('function with a duplicate name found "' + functionName + '"!');
  }
  analyzer.functionLoopAbstractionMap[functionName] = new TreeTracker();
  analyzer.functionReturnConditionMap[functionName] = [];

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
  analyzer.removeScope();

  // mark that we left this function
  analyzer.currentFunctionName = oldFunctionName;

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