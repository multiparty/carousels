const Enum = require('../../utils/enum.js');

// Enum containing supported types
const TYPE_ENUM = new Enum('TYPE_ENUM', 'NUMBER', 'ARRAY', 'BOOLEAN', 'STRING', 'ANY');

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

// All dependent types must have this interface (constructors can differ)
function NumberDependentType(value) {
  this.value = value;
}
NumberDependentType.compatible = function (dataType) {
  return dataType === TYPE_ENUM.NUMBER;
};
NumberDependentType.toString = function () {
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

module.exports = {
  TYPE_ENUM: TYPE_ENUM,
  Type: Type,
  FunctionType: FunctionType,
  NumberDependentType: NumberDependentType,
  ArrayDependentType: ArrayDependentType
};