const carouselsTypes = require('../symbols/types.js');

const makeType = function (alterObject) {
  throw new Error('Carousels hints do not support providing no type yet!');
};

const alterType = function (alterObject, existingType) {
  // if type is provided, make a completely new type
  if (alterObject.type != null) {
    return makeType(alterObject);
  }
  return existingType.alter(alterObject);
};

const CarouselsAnnotation = function (node, pathStr) {
  const rustString = JSON.parse(node.rustString);

  const varName = rustString.var;
  const existingType = this.analyzer.variableTypeMap.get(varName);
  this.analyzer.variableTypeMap.set(varName, alterType(rustString, existingType));

  return {
    type: carouselsTypes.UNIT,
    metric: this.analyzer.metric.initial
  }
};

module.exports = {
  CarouselsAnnotation: CarouselsAnnotation
};