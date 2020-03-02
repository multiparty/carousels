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
  if (this.hasDependentType() && this.dependentType.compatible(this.dataType)) {
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
Type.fromTypeNode = function (typeNode, dependentType) {
  const type = typeNode.type.toUpperCase();
  const secret = typeNode.secret;

  // compute dependentType
  if (dependentType === undefined) {
    if (type === TYPE_ENUM.ARRAY) {
      // TODO: Update IR with nested dependentType in typeNode for generics (or just arrays?)
      dependentType = new ArrayDependentType(Type.fromTypeNode(typeNode.dependentType));
    } else {
      // TODO: right now arrays are of numbers by default! remove this default in the future
      dependentType = new ArrayDependentType(new Type(TYPE_ENUM.NUMBER, secret));
    }
  }

  return new Type(type, secret, dependentType);
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
FunctionType.prototype.hasDependentParameters = function () {
  for (let i = 0; i < this.parameterTypes.length; i++) {
    const parameter = this.parameterTypes[i];
    if (parameter.is(TYPE_ENUM.ARRAY) && parameter.hasDependentType('length')) {
      return true;
    }
  }

  return false;
};
FunctionType.fromFunctionDefinitionNode = function (node) {
  // figure out parameter types
  // array parameters are assigned "fresh" new symbolic parameters as lengths
  const parametersType = [];
  for (let i = 0; i < node.parameters.length; i++) {
    const parameterType = Type.fromTypeNode(node.parameters[i].type);

    if (parameterType.is(TYPE_ENUM.ARRAY)) {
      const lengthParameter = Parameter.forArrayLength(node.parameters[i].name);
      parameterType.dependentType.length = lengthParameter;
    }

    parametersType.push(parameterType);
  }

  // figure out return type
  const returnType = Type.fromTypeNode(node.returnType);
  return new FunctionType(null, parametersType, returnType);
};

module.exports = {
  TYPE_ENUM: TYPE_ENUM,
  UNIT_TYPE: new Type(TYPE_ENUM.UNIT, false),
  Type: Type,
  FunctionType: FunctionType,
  NumberDependentType: NumberDependentType,
  ArrayDependentType: ArrayDependentType
};