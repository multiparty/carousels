const Enum = require('../../utils/enum.js');
const math = require('../math.js');
const Parameter = require('./parameter.js');

let dependentTypes = require('./dependentTypes.js');

// Enum containing supported types
const TYPE_ENUM = new Enum('TYPE_ENUM', ['NUMBER', 'ARRAY', 'BOOLEAN', 'STRING', 'ANY', 'UNIT', 'FUNCTION', 'RANGE', 'SYMBOL']);

// Abstract type class
function Type(dataType, secret, dependentType) {
  this.secret = secret;
  this.dataType = dataType;
  this.dependentType = dependentType;

  TYPE_ENUM.__assert(this.dataType);
  if (this.secret !== true && this.secret !== false) {
    throw new Error('Secret must be either true or false! Instead it was "' + this.secret + '".');
  }
  if (this.hasDependentType() && !this.dependentType.compatible(this)) {
    throw new Error('Unexpected dependent type "' + this.dependentType + '" given for type "' + this + '"!');
  }
  if ((this.dataType === TYPE_ENUM.UNIT || this.dataType === TYPE_ENUM.RANGE ||
      this.dataType === TYPE_ENUM.SYMBOL || this.dataType === TYPE_ENUM.STRING ||
      this.dataType === TYPE_ENUM.FUNCTION)
    && this.secret) {
    throw new Error('Type "' + this.dataType + '" cannot be secret!');
  }
}
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
Type.prototype.copy = function (dependentType) {
  if (dependentType == null && this.dependentType) {
    dependentType = this.dependentType.copy();
  }
  return new Type(this.dataType, this.secret, dependentType);
};
Type.prototype.match = function (otherType) {
  return otherType != null && this.dataType === otherType.dataType;
};
Type.prototype.conflicts = function (otherType) {
  if (!(otherType instanceof Type)) {
    return true;
  }
  if (this.dataType !== otherType.dataType && otherType.dataType !== TYPE_ENUM.ANY) {
    return true;
  }
  if (this.dependentType && otherType.dependentType) {
    return this.dependentType.conflicts(otherType.dependentType);
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
      throw new Error('Cannot combine non-matching types "' +
        this.toString() + '" and "' + otherType.toString() + '"!');
    }

    if (this.dependentType != null && otherType.dependentType != null) {
      return this.copy(this.dependentType.combine(otherType.dependentType, dependentCombiner));
    }
  }

  return this.copy();
};
Type.fromTypeNode = function (typeNode, pathStr) {
  if (typeNode == null) {
    return {
      type: null,
      parameters: []
    };
  }

  const typeString = typeNode.type.toUpperCase();
  TYPE_ENUM.__assert(typeString);

  const secret = typeNode.secret;
  // compute dependentType
  switch (typeString) {
    case TYPE_ENUM.NUMBER:
      return NumberType.fromTypeNode(typeNode, pathStr);

    case TYPE_ENUM.BOOLEAN:
      return BooleanType.fromTypeNode(typeNode, pathStr);

    case TYPE_ENUM.ARRAY:
      return ArrayType.fromTypeNode(typeNode, pathStr);

    case TYPE_ENUM.RANGE:
      return RangeType.fromTypeNode(typeNode, pathStr);

    case TYPE_ENUM.STRING:
    case TYPE_ENUM.ANY:
    case TYPE_ENUM.UNIT:
      return {
        type: new Type(typeString, secret),
        parameters: []
      };

    default:
      throw new Error('TypeNode has illegal type "' + typeString + '"!');
  }
};

// Concrete Type Classes
function NumberType(secret, value) {
  Type.call(this, TYPE_ENUM.NUMBER, secret, new dependentTypes.ValueDependentType(value));
}
function BooleanType(secret, value) {
  Type.call(this, TYPE_ENUM.BOOLEAN, secret, new dependentTypes.ValueDependentType(value));
}
function ArrayType(secret, elementsType, length) {
  Type.call(this, TYPE_ENUM.ARRAY, secret, new dependentTypes.ArrayDependentType(elementsType, length));
}
function RangeType(startType, endType, incrementType, size) {
  Type.call(this, TYPE_ENUM.RANGE, false, new dependentTypes.RangeDependentType(startType, endType, incrementType, size));
}
function AnyType(secret) {
  Type.call(this, TYPE_ENUM.ANY, secret);
}
function StringType(secret) {
  Type.call(this, TYPE_ENUM.STRING, secret);
}

NumberType.prototype = Object.create(Type.prototype);
BooleanType.prototype = Object.create(Type.prototype);
ArrayType.prototype = Object.create(Type.prototype);
RangeType.prototype = Object.create(Type.prototype);
AnyType.prototype = Object.create(Type.prototype);
StringType.prototype = Object.create(Type.prototype);

// static initializers
NumberType.fromTypeNode = function (typeNode, pathStr) {
  const secret = typeNode.secret;
  const parameter = Parameter.forValue(pathStr);
  return {
    type: new NumberType(secret, parameter.mathSymbol),
    parameters: [parameter]
  };
};
BooleanType.fromTypeNode = function (typeNode, pathStr) {
  const secret = typeNode.secret;
  const parameter = Parameter.forValue(pathStr);
  return {
    type: new BooleanType(secret, parameter.mathSymbol),
    parameters: [parameter]
  };
};
ArrayType.fromTypeNode = function (typeNode, pathStr) {
  const secret = typeNode.secret;
  const lengthParameter = Parameter.forArrayLength(pathStr);
  delete typeNode['dependentType']; // TODO: this ignores un-parsable types insides array in IR
  let nested = Type.fromTypeNode(typeNode.dependentType, pathStr + '[elementsType]');
  if (nested.type == null) { // Default array are of numbers!
    nested = NumberType.fromTypeNode({secret: typeNode.secret}, pathStr + '[elementsType]');
  }

  return {
    type: new ArrayType(secret, nested.type, lengthParameter.mathSymbol),
    parameters: nested.parameters.concat([lengthParameter])
  };
};
RangeType.fromTypeNode = function (typeNode, pathStr) {
  const secret = typeNode.secret;
  if (secret) {
    throw new Error('Range TypeNode "' + pathStr + '" cannot be secret!');
  }

  const start = NumberType.fromTypeNode({secret: false}, pathStr + '[start]');
  const end = NumberType.fromTypeNode({secret: false}, pathStr + '[end]');
  const increment = NumberType.fromTypeNode({secret: false}, pathStr + '[increment]');

  return {
    type: RangeType.fromComponents(start.type, end.type, increment.type).type,
    parameters: start.parameters.concat(end.parameters).concat(increment.parameters)
  };
};
RangeType.fromComponents = function (startType, endType, incrementType, pathStr) {
  // Create a range for the given components types
  // if startType or endType were null, they will be assigned number types with a fresh new symbolic parameter is created for either
  // if incrementType is null, a new number type is created with value 1
  // size is computed symbolically from the values
  let parameters = [];

  if (startType == null) {
    const result = NumberType.fromTypeNode({secret: false}, pathStr + '[start]');
    startType = result.type;
    parameters = parameters.concat(result.parameters);
  }
  if (endType == null) {
    const result = NumberType.fromTypeNode({secret: false}, pathStr + '[end]');
    startType = result.type;
    parameters = parameters.concat(result.parameters);
  }
  if (incrementType == null) {
    incrementType = new NumberType(false, math.parse('1'));
  }

  // Assert building types are all numbers
  if (!startType.is(TYPE_ENUM.NUMBER) || !endType.is(TYPE_ENUM.NUMBER) || !incrementType.is(TYPE_ENUM.NUMBER)) {
    throw new Error('Range "' + pathStr + '" is expected to have number start, end and increment. Found "' +
      startType + '", "' + endType + '", "' + incrementType + '" instead!');
  }

  // Compute range size symbolically
  let size = math.sub(endType.dependentType.value, startType.dependentType.value);
  if (incrementType.dependentType.value.toString() !== '1') {
    size = math.div(size, incrementType.dependentType.value);
  }

  return {
    type: new RangeType(startType, endType, incrementType, size),
    parameters: parameters
  };
};

// singleton types
const UNIT_TYPE = new Type(TYPE_ENUM.UNIT, false);

// Function Type stores the function signature
function FunctionType(thisType, parametersType, returnType) {
  Type.call(this, TYPE_ENUM.FUNCTION, false, new dependentTypes.FunctionDependentType(thisType, parametersType, returnType));
}
FunctionType.prototype = Object.create(Type.prototype);

// SymbolType refers to a Syntactic Code Construct
function SymbolType(symbol) {
  Type.call(this, TYPE_ENUM.SYMBOL, false);
  this.symbol = symbol;
}
SymbolType.prototype = Object.create(Type.prototype);
SymbolType.prototype.toString = function () {
  return this.symbol;
};
SymbolType.prototype.conflicts = function (otherType) {
  if (!(otherType instanceof SymbolType)) {
    return true;
  } else if (this.symbol !== otherType.symbol) {
    return true;
  }

  throw new Error('SymbolType does not support .conflicts()!');
};
SymbolType.prototype.combine = function () {
  throw new Error('SymbolType does not support .combine()!');
};

// expose the dependent type symbols
dependentTypes = dependentTypes(Type, TYPE_ENUM);

module.exports = {
  ENUM: TYPE_ENUM,
  UNIT: UNIT_TYPE,
  fromTypeNode: Type.fromTypeNode,
  // Concrete Type Classes
  NumberType: NumberType,
  BooleanType: BooleanType,
  ArrayType: ArrayType,
  RangeType: RangeType,
  AnyType: AnyType,
  StringType: StringType,
  SymbolType: SymbolType,
  FunctionType: FunctionType
};