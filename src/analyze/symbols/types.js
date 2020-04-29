const Enum = require('../../utils/enum.js');
const math = require('../math.js');
const Parameter = require('./parameter.js');

let dependentTypes = require('./dependentTypes.js');

// Enum containing supported types
const TYPE_ENUM = new Enum('TYPE_ENUM', [
  'NUMBER', 'FLOAT', 'ARRAY', 'BOOL', 'STR', 'MATRIX',
  'ANY', 'UNIT', 'FUNCTION', 'RANGE', 'SYMBOL', 'ABSTYPE'
]);
const TYPE_ALIASES = {
  // special case Matrix
  VECTOR: 'MATRIX'
};

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
    throw new Error('Unexpected dependent type "' + this.dependentType + '" given for type "' + this.dataType + '"!');
  }
  if ((this.dataType === TYPE_ENUM.UNIT || this.dataType === TYPE_ENUM.RANGE ||
      this.dataType === TYPE_ENUM.SYMBOL || this.dataType === TYPE_ENUM.STR ||
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
Type.prototype.copy = function () {
  let dependentType = null;
  if (this.dependentType) {
    dependentType = this.dependentType.copy();
  }
  return new Type(this.dataType, this.secret, dependentType);
};
Type.prototype.match = function (otherType) {
  return otherType != null && this.dataType === otherType.dataType && this.secret === otherType.secret;
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
Type.prototype.combine = function (otherType, condition) {
  if (otherType != null) {
    // other type exists
    if (this.secret !== otherType.secret) {
      throw new Error('Cannot combine secret and non-secret types "' +
        this.toString() + '" and "' + otherType.toString() + '"!');
    }

    if (this.dataType !== otherType.dataType) {
      throw new Error('Cannot combine non-matching types "' +
        this.toString() + '" and "' + otherType.toString() + '"!');
    }

    if (this.dependentType != null && otherType.dependentType != null) {
      return this.copy(this.dependentType.combine(otherType.dependentType, condition));
    }
  } else {
    // other type does not exist
    // ensure type can only be accessed when conditions are met
    if (this.dependentType != null) {
      return this.copy(this.dependentType.combine(null, condition));
    }
  }

  // for useless types
  return this.copy();
};
Type.prototype.alter = function (alterObj) {
  if (alterObj.dataType != null) {
    throw new Error('cannot alter with "dataType", please use new: true and provide all type details in the hint!');
  }
  if (alterObj.secret != null) {
    this.secret = alterObj.secret;
  }
  return this;
};
Type.fromTypeNode = function (typeNode, pathStr) {
  if (typeNode == null) {
    throw new Error('Type.fromTypeNode called on "null" node!');
  }

  // Type information exists, but for some reason IR parser could not parse the base type
  // likely a complicated generic rust type, we use number as default
  if (typeNode.type == null || typeNode.type === '') {
    typeNode.type = 'number';
  }

  // Parse type according to cases
  let typeString = typeNode.type.toUpperCase();
  let alias = undefined;
  if (TYPE_ALIASES[typeString] != null) {
    alias = typeString;
    typeString = TYPE_ALIASES[typeString];
  }

  // assert type is supported!
  TYPE_ENUM.__assert(typeString);

  const secret = typeNode.secret;
  // compute dependentType
  switch (typeString) {
    case TYPE_ENUM.NUMBER:
      return NumberType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.BOOL:
      return BooleanType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.FLOAT:
      return FloatType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.ARRAY:
      return ArrayType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.MATRIX:
      return MatrixType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.RANGE:
      return RangeType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.STR:
      return StringType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.ANY:
      return AnyType.fromTypeNode(typeNode, pathStr, alias);

    case TYPE_ENUM.UNIT:
      return UNIT_TYPE;

    default:
      throw new Error('TypeNode has illegal type "' + typeString + '"!');
  }
};

// Concrete Type Classes
function NumberType(secret, value) {
  Type.call(this, TYPE_ENUM.NUMBER, secret, new dependentTypes.ValueDependentType(value));
}
function BooleanType(secret, value) {
  Type.call(this, TYPE_ENUM.BOOL, secret, new dependentTypes.ValueDependentType(value));
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
  Type.call(this, TYPE_ENUM.STR, secret);
}
function FloatType(secret, value) {
  Type.call(this, TYPE_ENUM.FLOAT, secret, new dependentTypes.ValueDependentType(value));
}
function MatrixType(secret, elementsType, rows, cols) {
  Type.call(this, TYPE_ENUM.MATRIX, secret, new dependentTypes.MatrixDependentType(elementsType, rows, cols));
}

NumberType.prototype = Object.create(Type.prototype);
BooleanType.prototype = Object.create(Type.prototype);
ArrayType.prototype = Object.create(Type.prototype);
RangeType.prototype = Object.create(Type.prototype);
AnyType.prototype = Object.create(Type.prototype);
StringType.prototype = Object.create(Type.prototype);
FloatType.prototype = Object.create(Type.prototype);
MatrixType.prototype = Object.create(Type.prototype);

// override copy function
NumberType.prototype.copy = function () {
  return new NumberType(this.secret, this.dependentType.value);
};
BooleanType.prototype.copy = function () {
  return new BooleanType(this.secret, this.dependentType.value);
};
ArrayType.prototype.copy = function () {
  return new ArrayType(this.secret, this.dependentType.elementsType.copy(), this.dependentType.length);
};
RangeType.prototype.copy = function () {
  const copyDep = this.dependentType.copy();
  return new RangeType(copyDep.startType, copyDep.endType, copyDep.incrementType, copyDep.size);
};
AnyType.prototype.copy = function () {
  return new AnyType(this.secret);
};
StringType.prototype.copy = function () {
  return new StringType(this.secret);
};
FloatType.prototype.copy = function () {
  return new FloatType(this.secret, this.dependentType.value);
};
MatrixType.prototype.copy = function () {
  return new MatrixType(this.secret, this.dependentType.elementsType.copy(), this.dependentType.rows, this.dependentType.cols);
};

// override alter function
NumberType.prototype.alter = function (alterObj) {
  Type.prototype.alter.call(this, alterObj);
  const value = alterObj.value;
  if (value != null) {
    this.dependentType.value = math.parse(value);
  }
  return this;
};
BooleanType.prototype.alter = NumberType.prototype.alter;
ArrayType.prototype.alter = function (alterObj) {
  Type.prototype.alter.call(this, alterObj);
  if (alterObj.length != null) {
    this.dependentType.length = math.parse(alterObj.length);
  }
  if (alterObj.elementsType != null) {
    this.dependentType.elementsType.alter(alterObj.elementsType);
  }
  return this;
};
RangeType.prototype.alter = function (alterObj) {
  Type.prototype.alter.call(this, alterObj);
  if (alterObj.size != null) {
    this.dependentType.size = math.parse(alterObj.size);
  }
  if (alterObj.startType != null) {
    this.dependentType.startType.alter(alterObj.startType);
  }
  if (alterObj.endType != null) {
    this.dependentType.endType.alter(alterObj.endType);
  }
  if (alterObj.incrementType != null) {
    this.dependentType.incrementType.alter(alterObj.incrementType);
  }
  return this;
};
FloatType.prototype.alter = NumberType.prototype.alter;
MatrixType.prototype.alter = function (alterObj) {
  Type.prototype.alter.call(this, alterObj);
  if (alterObj.rows != null) {
    this.dependentType.rows = math.parse(alterObj.rows);
  }
  if (alterObj.cols != null) {
    this.dependentType.cols = math.parse(alterObj.cols);
  }
  if (alterObj.elementsType != null) {
    this.dependentType.elementsType.alter(alterObj.elementsType);
  }
  return this;
};

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
  const lengthParameter = Parameter.forArrayLength(pathStr);
  const nested = Type.fromTypeNode(typeNode.dependentType, pathStr + '[elementsType]');
  const secret = typeNode.secret || nested.type.secret;

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
    incrementType = new NumberType(false, math.ONE);
  }

  // Assert building types are all numbers
  if (!startType.is(TYPE_ENUM.NUMBER) || !endType.is(TYPE_ENUM.NUMBER) || !incrementType.is(TYPE_ENUM.NUMBER)) {
    throw new Error('Range "' + pathStr + '" is expected to have number start, end and increment. Found "' +
      startType + '", "' + endType + '", "' + incrementType + '" instead!');
  }

  // Compute range size symbolically
  let size = math.sub(endType.dependentType.value, startType.dependentType.value);
  if (incrementType.dependentType.value.toString() !== '1') {
    size = math.ceilDiv(size, incrementType.dependentType.value);
  }

  return {
    type: new RangeType(startType, endType, incrementType, size),
    parameters: parameters
  };
};
FloatType.fromTypeNode = function (typeNode, pathStr) {
  const secret = typeNode.secret;
  const parameter = Parameter.forValue(pathStr);
  return {
    type: new FloatType(secret, parameter.mathSymbol),
    parameters: [parameter]
  };
};
MatrixType.fromTypeNode = function (typeNode, pathStr, alias) {
  const rowsParameter = Parameter.forMatrixRows(pathStr);
  const nested = Type.fromTypeNode(typeNode.dependentType, pathStr + '[elementsType]');
  const secret = typeNode.secret || nested.type.secret;
  const parameters = nested.parameters.concat([rowsParameter]);

  let colsSymbol = '1';
  if (alias !== 'VECTOR') {
    colsSymbol = Parameter.forMatrixCols(pathStr);
    parameters.push(colsSymbol);
    colsSymbol = colsSymbol.mathSymbol;
  }

  return {
    type: new MatrixType(secret, nested.type, rowsParameter.mathSymbol, colsSymbol),
    parameters: parameters
  };
};
StringType.fromTypeNode = function (typeNode, pathStr) {
  return {
    type: new StringType(typeNode.secret),
    parameters: []
  };
};
AnyType.fromTypeNode = function (typeNode, pathStr) {
  return {
    type: new AnyType(typeNode.secret),
    parameters: []
  };
};

// singleton types
const UNIT_TYPE = new Type(TYPE_ENUM.UNIT, false);

// Function Type stores the function signature
function FunctionType(thisType, parametersType, returnType) {
  Type.call(this, TYPE_ENUM.FUNCTION, false, new dependentTypes.FunctionDependentType(thisType, parametersType, returnType));
}
FunctionType.prototype = Object.create(Type.prototype);
FunctionType.prototype.copy = function () {
  const copyDep = this.dependentType.copy();
  return new FunctionType(copyDep.thisType, copyDep.parametersType, copyDep.returnType);
};
FunctionType.prototype.alter = function (alterObj) {
  throw new Error('Cannot alter function type using annotation! please use new: true and provide the full type information');
};

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
SymbolType.prototype.copy = function () {
  return new SymbolType(this.symbol);
};
SymbolType.prototype.match = function (otherType) {
  return Type.prototype.match.apply(this, arguments) && this.symbol === otherType.symbol;
};
SymbolType.prototype.alter = function (alterObj) {
  Type.prototype.alter.call(this, alterObj);
  if (alterObj.symbol != null) {
    this.symbol = alterObj.symbol;
  }
  return this;
};

// AbsType is essentially a named/keyword type
function AbsType(typeName) {
  Type.call(this, TYPE_ENUM.ABSTYPE, false);
  this.typeName = typeName;
}
AbsType.prototype = Object.create(Type.prototype);
AbsType.prototype.toString = function () {
  return '<type:' + this.typeName + ',secret:' + this.secret + '>';
};
AbsType.prototype.conflicts = function (otherType) {
  if (!(otherType instanceof AbsType)) {
    return true;
  } else if (this.typeName !== otherType.typeName) {
    return true;
  }

  throw new Error('AbsType does not support .conflicts()!');
};
AbsType.prototype.combine = function () {
  throw new Error('AbsType does not support .combine()!');
};
AbsType.prototype.copy = function () {
  return new AbsType(this.typeName);
};
AbsType.prototype.match = function (otherType) {
  return Type.prototype.match.apply(this, arguments) && this.typeName === otherType.typeName;
};
AbsType.prototype.alter = function (alterObj) {
  Type.prototype.alter.call(this, alterObj);
  if (alterObj.typeName != null) {
    this.typeName = alterObj.typeName;
  }
  return this;
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
  FloatType: FloatType,
  MatrixType: MatrixType,
  SymbolType: SymbolType,
  AbsType: AbsType,
  FunctionType: FunctionType
};