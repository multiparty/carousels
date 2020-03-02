const carouselsTypes = require('../symbols/types.js');
const FunctionAbstraction = require('../symbols/functionAbstraction.js');

const FunctionDefinition = function (node) {
  // Create the function type
  const functionType = carouselsTypes.FunctionType.fromFunctionDefinitionNode(node);
  this.functionTypeMap.add(node.name, functionType);
  this.functionTypeMap.addScope();

  // If return type has needs a dependent clause/parameter (e.g. it is an array)
  // then we must create an abstraction for it
  // e.g. a function g(array<length:a>) => array<length:r> has abstraction
  // r = G_return(a)
  if (functionType.returnType.is(carouselsTypes.TYPE_ENUM.ARRAY)) {
    const returnAbstraction = new FunctionAbstraction(node.name, 'returnAbstraction', functionType);
    this.functionReturnAbstractionMap.add(node.name, returnAbstraction);
  }
  this.functionReturnAbstractionMap.addScope();

  // Create metric abstractions for this function
  // e.g. a function g(array<length:a>) => * has
  // number of round = G_rounds(a)
  this.mapMetrics(function (metricTitle) {
    const metricAbstraction = new FunctionAbstraction(node.name, metricTitle, functionType);
    this.functionMetricAbstractionMap[metricTitle].add(metricAbstraction);
    this.functionMetricAbstractionMap[metricTitle].addScope();
  });


};

const ReturnStatement = function (node) {};

const FunctionCall = function (node) {};

module.exports = {
  FunctionDefinition: FunctionDefinition,
  ReturnStatement: ReturnStatement,
  FunctionCall: FunctionCall
};