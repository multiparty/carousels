const carouselsTypes = require('../symbols/types.js');
const math = require('../math.js');

const makeType = function (alterObject) {
  const topType = alterObject.dataType;
  if (topType === 'number') {
    return new carouselsTypes.NumberType(alterObject.secret, math.parse(alterObject.value));
  }
  if (topType === 'boolean') {
    return new carouselsTypes.BooleanType(alterObject.secret, math.parse(alterObject.value));
  }
  if (topType === 'string') {
    return new carouselsTypes.StringType(alterObject.secret);
  }
  if (topType === 'unit') {
    return carouselsTypes.UNIT;
  }
  if (topType === 'any') {
    return new carouselsTypes.AnyType(alterObject.secret);
  }
  if (topType === 'abs') {
    return new carouselsTypes.AbsType(alterObject.typeName);
  }
  if (topType === 'symbol') {
    return new carouselsTypes.SymbolType(alterObject.symbol);
  }
  if (topType === 'range') {
    const startType = makeType(alterObject.startType);
    const endType = makeType(alterObject.endType);
    const incrementType = makeType(alterObject.incrementType);
    return new carouselsTypes.RangeType(startType, endType, incrementType, math.parse(alterObject.size));
  }
  if (topType === 'array') {
    const elementsType = makeType(alterObject.elementsType);
    return new carouselsTypes.ArrayType(alterObject.secret, elementsType, math.parse(alterObject.length));
  }
  if (topType === 'function') {
    const thisType = alterObject.thisType ? makeType(alterObject.thisType) : null;
    const parametersType = alterObject.parametersType.map(makeType);
    const returnType = makeType(alterObject.returnType);
    return new carouselsTypes.FunctionType(thisType, parametersType, returnType);
  }

  throw new Error('Unsupported type "' + topType + '" in annotation!');
};

const alterType = function (alterObject, existingType) {
  // if type is provided, make a completely new type
  if (alterObject.new === true) {
    return makeType(alterObject);
  }
  return existingType.alter(alterObject);
};

const CarouselsAnnotation = function (node, pathStr) {
  const rustString = JSON.parse(node.rustString);

  const varName = rustString.var;
  const existingType = this.analyzer.variableTypeMap.get(varName).copy();
  const alteredType = alterType(rustString, existingType);
  this.analyzer.variableTypeMap.set(varName, alteredType);

  return {
    type: alteredType,
    metric: this.analyzer.metric.initial
  }
};

module.exports = {
  CarouselsAnnotation: CarouselsAnnotation
};