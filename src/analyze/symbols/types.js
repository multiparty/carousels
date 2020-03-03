const Enum = require('../../utils/enum.js');
const Parameter = require('./parameter.js');

// Enum containing supported types
const TYPE_ENUM = new Enum('TYPE_ENUM', 'NUMBER', 'ARRAY', 'BOOLEAN', 'STRING', 'ANY', 'UNIT');

// Type abstraction
function Type(dataType, secret, dependentType) {
  this.secret = secret;
  this.dataType = dataType;
  this.dependentType = dependentType;

  TYPE_ENUM.__assert(this.dataType);
  if (this.secret !== true && this.secret !== false) {
    throw new Error('Secret must be either true or false! Instead it was "' + this.secret + '".');
  }
  if (this.hasDependentType() && !this.dependentType.compatible(this.dataType)) {
    throw new Error('Unexpected dependent type "' + this.dependentType + '" given for non array type "' + this.dataType + '"!');
  }
}
Type.prototype.toString = function () { // used for regex matching against cost rules
  const dependentTypeString = this.hasDependentType() ? this.dependentType.toString() : '';
  const secretString = this.secret ? ',secret:true' : '';
  const preambleString = this.secret ? 'type:' : '';

  return '<' + preambleString + this.dataType.toLowerCase() + dependentTypeString + secretString + '>';
};
Type.prototype.hasDependentType = function (prop) {
  return this.dependentType != null && (prop == null || this.dependentType[prop] == null);
};
Type.prototype.is = function (dataType) {
  return this.dataType === dataType;
};
Type.prototype.copyWithDependentType = function (dependentType) {
  return new Type(this.dataType, this.secret, dependentType);
};
Type.fromTypeNode = function (pathStr, typeNode, dependentType) {
  const type = typeNode.type.toUpperCase();
  const secret = typeNode.secret;
  let parameters = [];

  // compute dependentType
  if (dependentType === undefined) {
    if (type === TYPE_ENUM.ARRAY) {
      const lengthParameter = Parameter.forArrayLength(pathStr);
      parameters.push(lengthParameter);

      if (typeNode.dependentType != null) { // TODO: Update IR with nested dependentType in typeNode for generics (or just arrays?)
        const nestedType = Type.fromTypeNode(pathStr + '[dependentType]', typeNode.dependentType);
        parameters = parameters.concat(nestedType.parameters);
        dependentType = new ArrayDependentType(nestedType.type, lengthParameter.mathSymbol);
      } else { // TODO: right now arrays are of numbers by default! remove this default in the future
        const valueParameter = Parameter.forNumberValue(pathStr + '[dependentType]');
        parameters.push(valueParameter);
        dependentType = new ArrayDependentType(new Type(TYPE_ENUM.NUMBER, secret, valueParameter.mathSymbol), lengthParameter.mathSymbol);
      }
    }

    if (type === TYPE_ENUM.NUMBER) {
      const valueParameter = Parameter.forNumberValue(pathStr);
      parameters.push(valueParameter);
      dependentType = new NumberDependentType(valueParameter.mathSymbol);
    }
  }

  return {
    type: new Type(type, secret, dependentType),
    parameters: parameters
  };
};

// All dependent types must have this interface (constructors can differ)
function NumberDependentType(value) {
  this.value = value;
}
NumberDependentType.prototype.compatible = function (dataType) {
  return dataType === TYPE_ENUM.NUMBER;
};
NumberDependentType.prototype.toString = function () {
  return '<value:' + this.value + '>';
};

// length: either constant number or Parameter
function ArrayDependentType(dataType, length) {
  this.dataType = dataType;
  this.length = length;
}
ArrayDependentType.prototype.compatible = function (dataType) {
  return dataType === TYPE_ENUM.ARRAY;
};
ArrayDependentType.prototype.toString = function () {
  return '<datatype:' + this.dataType.toString() + ',length:' + this.length + '>';
};

// Function type behaves differently
// thisType can be null when this is not a method
function FunctionType(thisType, parameterTypes, returnType) {
  this.thisType = thisType;
  this.parameterTypes = parameterTypes;
  this.returnType = returnType;
}
FunctionType.prototype.toString = function () {
  const thisType = this.thisType != null ? this.thisType.toString() : '';
  const params = this.parameterTypes.map(function (parameterType) {
    return parameterType.toString();
  });
  return '<' + thisType + '(' + params.join(',') + ')=>' + this.returnType.toString() + '>';
};
// instance of Parameter corresponding to dependent types of this.parameterTypes in order
FunctionType.prototype.getDependentParameters = function () {
  const symbols = [];
  for (let i = 0; i < this.parameterTypes.length; i++) {
    let parameterType = this.parameterTypes[i];
    let dependentParameter = null;
    if (parameterType.is(TYPE_ENUM.ARRAY)) {
      dependentParameter = parameterType.dependentType.length;
    } else if (parameterType.is(TYPE_ENUM.NUMBER)) {
      dependentParameter = parameterType.dependentType.value;
    }
    symbols.push(dependentParameter);
  }

  return symbols;
};
FunctionType.fromFunctionDefinitionNode = function (pathStr, node) {
  // figure out return type
  const returnType = Type.fromTypeNode(pathStr + '[return]', node.returnType);

  // figure out parameter types
  // array parameters are assigned "fresh" new symbolic parameters as lengths
  const parametersType = [];
  let parameters = returnType.parameters;
  for (let i = 0; i < node.parameters.length; i++) {
    const paramPathStr = pathStr + '@' + node.parameters[i].name.name;
    const parameterType = Type.fromTypeNode(paramPathStr, node.parameters[i].type);
    parameters = parameters.concat(parameterType.parameters);
    parametersType.push(parameterType.type);
  }

  // return function type and all the symbolic parameters created for its parameters
  return {
    functionType: new FunctionType(null, parametersType, returnType.type),
    parameters: parameters
  };
};

module.exports = {
  TYPE_ENUM: TYPE_ENUM,
  UNIT_TYPE: new Type(TYPE_ENUM.UNIT, false),
  Type: Type,
  FunctionType: FunctionType,
  NumberDependentType: NumberDependentType,
  ArrayDependentType: ArrayDependentType
};