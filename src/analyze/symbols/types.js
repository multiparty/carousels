const Enum = require('../../utils/enum.js');
const Parameter = require('./parameter.js');
const math = require('../math.js');

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
Type.prototype._type = true;
Type.prototype.toString = function () { // used for regex matching against cost rules
  const dependentTypeString = this.hasDependentType() ? this.dependentType.toString() : '';
  return '<type:' + this.dataType.toLowerCase() + dependentTypeString + ',secret:' + this.secret + '>';
};
Type.prototype.hasDependentType = function (prop) {
  return this.dependentType != null && (prop == null || this.dependentType[prop] != null);
};
Type.prototype.is = function (dataType) {
  return this.dataType === dataType;
};
Type.prototype.copy = function () {
  const depCopy = this.dependentType ? this.dependentType.copy() : null;
  return new Type(this.dataType, this.secret, depCopy);
};
Type.prototype.conflicts = function (otherType) {
  if (!(otherType instanceof Type)) {
    return true;
  }

  if (this.dataType !== otherType.dataType && otherType.dataType !== TYPE_ENUM.ANY) {
    return true;
  }

  if (this.dataType === otherType.datatype && this.dataType === TYPE_ENUM.ARRAY) {
    if (this.dependentType != null && otherType.dependentType != null) {
      return this.dependentType.dataType.conflicts(otherType.dependentType.dataType);
    }
  }

  return false;
};
Type.prototype.combine = function (otherType, dependentCombiner) {
  if (otherType != null && otherType.dataType !== TYPE_ENUM.UNIT) {
    if (this.secret !== otherType.secret) {
      throw new Error('Cannot combine secret and non-secret types "' +
        this.toString() + '" and "' + otherType.toString() + '"!');
    }

    if (this.dataType !== otherType.dataType) {
      return new Type(TYPE_ENUM.ANY, this.secret);
    }

    if (this.dataType === TYPE_ENUM.ARRAY) {
      const dependentDataType = this.dependentType.dataType.combine(otherType.dependentType.dataType, dependentCombiner);
      const combinedLength = dependentCombiner(this.dependentType.length, otherType.dependentType.length);
      return new Type(TYPE_ENUM.ARRAY, this.secret, new ArrayDependentType(dependentDataType, combinedLength));
    }

    if (this.dataType === TYPE_ENUM.NUMBER || this.dataType === TYPE_ENUM.BOOLEAN) {
      const combinedValue = dependentCombiner(this.dependentType.value, otherType.dependentType.value);
      return new Type(this.dataType, this.secret, new ValueDependentType(combinedValue));
    }
  }

  return new Type(this.dataType, this.secret, this.dependentType);
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
        const valueParameter = Parameter.forValue(pathStr + '[dependentType]');
        parameters.push(valueParameter);
        dependentType = new ArrayDependentType(new Type(TYPE_ENUM.NUMBER, secret, valueParameter.mathSymbol), lengthParameter.mathSymbol);
      }
    }

    if (type === TYPE_ENUM.NUMBER || type === TYPE_ENUM.BOOLEAN) {
      const valueParameter = Parameter.forValue(pathStr);
      parameters.push(valueParameter);
      dependentType = new ValueDependentType(valueParameter.mathSymbol);
    }
  }

  return {
    type: new Type(type, secret, dependentType),
    parameters: parameters
  };
};

// All dependent types must have this interface (constructors can differ)
function ValueDependentType(value) {
  this.value = value;
}
ValueDependentType.prototype.compatible = function (dataType) {
  return dataType === TYPE_ENUM.NUMBER || dataType === TYPE_ENUM.BOOLEAN;
};
ValueDependentType.prototype.toString = function () {
  const valStr = this.value ? this.value.toString().replace(/\s/g, '') : '';
  return '<value:' + valStr + '>';
};
ValueDependentType.prototype.copy = function () {
  return new ValueDependentType(this.value);
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
  const lenStr = this.length ? this.length.toString().replace(/\s/g, '') : '';
  return '<datatype:' + this.dataType.toString() + ',length:' + lenStr + '>';
};
ArrayDependentType.prototype.copy = function () {
  return new ArrayDependentType(this.dataType.copy(), this.length);
};

// Function type behaves differently
// thisType can be null when this is not a method
function FunctionType(thisType, parameterTypes, returnType) {
  this.thisType = thisType;
  this.parameterTypes = parameterTypes;
  this.returnType = returnType;
}
FunctionType.prototype._functionType = true;
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
    } else if (parameterType.is(TYPE_ENUM.NUMBER) || parameterType.is(TYPE_ENUM.BOOLEAN)) {
      dependentParameter = parameterType.dependentType.value;
    }
    symbols.push(dependentParameter);
  }

  return symbols;
};

// SymbolType refers to a Syntactic Code Construct
function SymbolType(symbol) {
  this.symbol = symbol;
}
SymbolType.prototype._symbolType = true;
SymbolType.prototype.toString = function () {
  return this.symbol;
};

// Range: has a start, end and increment
function RangeType(startType, endType, incrementType) {
  this.startType = startType;
  this.endType = endType;
  this.incrementType = incrementType;

  if (this.incrementType == null) {
    this.incrementType = new Type(TYPE_ENUM.NUMBER, false, new ValueDependentType(math.parse('1')));
  }
}
RangeType.prototype._rangeType = true;
RangeType.prototype.toString = function () {
  return '[' + this.startType.toString() + ':' + this.endType.toString() +
    (this.incrementType != null ? ':' + this.incrementType.toString() : '') +
    ']';
};
RangeType.prototype.computeSize = function (pathStr) {
  // If dependent parameters exist, use them!
  if (this.startType.hasDependentType('value') && this.endType.hasDependentType('value')
      && this.incrementType.hasDependentType('value')) {

    this.size = math.div(math.sub(this.startType.dependentType.value, this.endType.dependentType.value),
      this.incrementType.dependentType.value);

    return [];
  }

  const parameter = Parameter.forRangeSize(pathStr);
  this.size = parameter.mathSymbol;
  return [parameter];
};

module.exports = {
  TYPE_ENUM: TYPE_ENUM,
  UNIT_TYPE: new Type(TYPE_ENUM.UNIT, false),
  Type: Type,
  FunctionType: FunctionType,
  SymbolType: SymbolType,
  RangeType: RangeType,
  ValueDependentType: ValueDependentType,
  ArrayDependentType: ArrayDependentType
};