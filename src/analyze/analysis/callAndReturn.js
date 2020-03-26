const carouselsTypes = require('../symbols/types.js');

const ReturnStatement = function (node, pathStr) {
  const res = this.visit(node.expression, pathStr + '[returnExpression]');

  // Return statement not allowed in typings and costs: skip!
  const metric = this.analyzer.metric.aggregateReturnStatement(node, {expression: res.type}, {expression: res.metric});

  return {
    type: res.type,
    metric: metric
  };
};

const localFunctionCall = function (node, pathStr) {
  // For traversing order consistency, not really useful..
  const functionName = node.function.name; // must be a NameExpression for now
  const functionResult = this.visit(node.function, pathStr + '[function]');
  const functionType = functionResult.type;
  const functionMetric = functionResult.metric;

  // visit parameters
  const parametersResult = visitParameters.call(this, node, pathStr);
  const parametersType = parametersResult.parametersType;
  const parametersMetric = parametersResult.parametersMetric;

  // Figure out return type (including dependent portion)
  const returnType = functionType.dependentType.returnType.copy();
  if (returnType.is(carouselsTypes.ENUM.ARRAY)) {
    // Has dependent portion: resolve it via return type abstraction
    const returnTypeAbstraction = this.analyzer.functionReturnAbstractionMap.get(functionName);
    returnType.dependentType.length = returnTypeAbstraction.concretize(parametersType);
  }

  // Figure out metric via metric abstraction
  const metricAbstraction = this.analyzer.functionMetricAbstractionMap.get(functionName);
  const callMetric = metricAbstraction.concretize(parametersMetric.map(this.analyzer.metric.store).concat(parametersType));

  // We do not need to look in the typing or cost rules
  // In a sense, we replaced them with the more accurate return and metric abstractions
  // We still need to aggregate all the different metrics of the children/components

  // construct children maps
  const childrenType = {
    function: functionType,
    parameters: parametersType,
    call: returnType
  };

  const childrenMetric = {
    function: functionMetric,
    parameters: parametersMetric,
    call: callMetric
  };

  // aggregate
  const aggregateMetric = this.analyzer.metric.aggregateFunctionCall(node, childrenType, childrenMetric);

  // Done
  return {
    type: returnType,
    metric: aggregateMetric
  };
};

const unknownFunctionCall = function (node, pathStr) {
  // can be either a name expression or a dot expression
  const functionResult = this.visit(node.function, pathStr + '[function]');
  let functionType = functionResult.type;
  let functionMetric = functionResult.metric;

  // visit parameters
  const parametersResult = visitParameters.call(this, node, pathStr);
  const parametersType = parametersResult.parametersType;
  const parametersMetric = parametersResult.parametersMetric;
  const parametersSecret = parametersResult.parametersSecret;

  // expression string for looking in typings and costs rules
  let expressionTypeStr = '(' + parametersType.join(',') + ')';
  if (node.function.nodeType === 'DotExpression') {
    expressionTypeStr = functionResult.leftType + '.' + functionResult.rightType + expressionTypeStr;
  } else {
    expressionTypeStr = node.function.name + expressionTypeStr;
  }

  // construct children maps
  const childrenType = {
    function: functionType,
    parameters: parametersType,
    leftType: functionResult.leftType,
    rightType: functionResult.rightType
  };
  const childrenMetric = {
    function: functionMetric,
    parameters: parametersMetric
  };

  // we have several cases:
  // NameExpression + functionType is not ANY: special function that was found in typings, apply it!
  // NameExpression + functionType is ANY: did not find the function anywhere, must try to find it in typings
  // DotExpression + functionType is not ANY: special function that was found in typings, apply it!
  // DotExpression + functionType is ANY: did not find the function anywhere, must try to find it in typings
  // functionMetric is never null: defaults to <METRIC>.initial
  let returnType;
  if (functionType.is && functionType.is(carouselsTypes.ENUM.ANY)) {
    // find function in typings
    if (this.analyzer.typings.findMatch(node, expressionTypeStr) !== undefined) {
      returnType = this.analyzer.typings.applyMatch(node, expressionTypeStr, pathStr, childrenType);
    } else {
      // function not found: return type is assumed to be ANY
      returnType = new carouselsTypes.AnyType(parametersSecret);
    }
  } else if (functionType instanceof carouselsTypes.FunctionType) {
    // functionType was already found by visiting node.function
    // apply it!
    returnType = functionType.dependentType.returnType.copy();
  } else {
    throw new Error('Cannot resolve type of function for function call "' + JSON.stringify(node.function) +
      '" properly! Found "' + functionType + '" instead of FunctionType');
  }

  // Aggregate metric
  const aggregateMetric = this.analyzer.metric.aggregateFunctionCall(node, childrenType, childrenMetric);

  // find metric in costs
  const finalMetric = this.analyzer.costs.applyMatch(node, expressionTypeStr, aggregateMetric);

  // done
  return {
    type: returnType,
    metric: finalMetric
  };
};

const visitParameters = function (node, pathStr) {
  // visit children
  let parametersSecret = false;
  const parametersType = [];
  const parametersMetric = [];
  for (let i = 0; i < node.parameters.length; i++) {
    const parameterResult = this.visit(node.parameters[i], pathStr + '[param'+i+']');
    parametersType.push(parameterResult.type);
    parametersMetric.push(parameterResult.metric);
    parametersSecret = parametersSecret || parameterResult.type.secret;
  }

  return {
    parametersType: parametersType,
    parametersMetric: parametersMetric,
    parametersSecret: parametersSecret
  };
};

const FunctionCall = function (node, pathStr) {
  const func = node.function;

  // If function is defined locally (for now this can only be true if it is a straight up function name):
  //    we do not look at typings or costs, and use our own abstraction
  // Else (can be either a function name or a dot expression)
  //    look at typing and metrics, the expression string looks like:
  //        <FUNC_NAME>(<param1Type>, <param2Type>, ...)                 for function name
  //        <thisType>.<FUNC_NAME>(<param1Type>, <param2Type>, ...)      for dot expression
  const definedLocally = func.nodeType === 'NameExpression' && this.analyzer.variableTypeMap.has(func.name);
  if (definedLocally) {
    return localFunctionCall.call(this, node, pathStr);
  } else {
    return unknownFunctionCall.call(this, node, pathStr);
  }
};

module.exports = {
  ReturnStatement: ReturnStatement,
  FunctionCall: FunctionCall
};