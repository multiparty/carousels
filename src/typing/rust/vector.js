const carouselsTypes = require('../../analyze/symbols/types.js');
const Parameter = require('../../analyze/symbols/parameter.js');

module.exports = [
  // Vector of 1s
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'Vector::ones\\(<type:number@D,secret:false>\\)'
    },
    value: function (node, pathStr, children) {
      const value = children.parameters[0].dependentType.value;
      const elementsType = new carouselsTypes.FloatType(false, '1');

      return {
        type: new carouselsTypes.MatrixType(false, elementsType, value, '1'),
        parameters: []
      };
    }
  },
  // inner product of vectors
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:(true|false)>\\*<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const type = children.operands[0].dependentType.elementsType.copy();
      type.secret = secret;

      return {
        type: type,
        parameters: []
      };
    }
  },
  // V = V.set(I, val) is our replacement for the V[I] = val
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:matrix@D,secret:(true|false)>\\.set\\(<type:number@D,secret:false>,@T\\)'
    },
    value: function (node, pathStr, children) {
      const secret = children.leftType.secret || children.parameters[1].secret;
      const returnType = children.leftType.copy();
      returnType.secret = secret;
      returnType.dependentType.elementsType.secret = secret;

      return {
        type: returnType,
        parameters: []
      };
    }
  },
  // element wise multiplication preserves dimensions
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'Vector::elementMult\\(<type:matrix@D,secret:(true|false)>,<type:matrix@D,secret:(true|false)>\\)'
    },
    value: function (node, pathStr, children) {
      const secret = children.parameters[0].secret || children.parameters[1].secret;
      const returnType = children.parameters[0].copy();
      returnType.secret = secret;
      returnType.dependentType.elementsType.secret = secret;

      return {
        type: returnType,
        parameters: []
      };
    }
  },
  // max over a vector/matrix
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '@NFB\\.max\\(<type:matrix<elementsType:@NFB,rows:(.*),cols:(.*)>,secret:(true|false)>\\)'
    },
    value: function (node, pathStr, children) {
      const parameter = Parameter.forValue(pathStr);
      const returnType = children.parameters[0].dependentType.elementsType.copy();
      returnType.dependentType.value = parameter.mathSymbol;

      return {
        type: returnType,
        parameters: [parameter]
      };
    }
  }
];