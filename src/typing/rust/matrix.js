const carouselsTypes = require('../../analyze/symbols/types.js');

module.exports = [
  // .len() of a matrix returns row count
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:matrix@D,secret:(true|false)>\\.len\\(\\)'
    },
    value: function (node, pathStr, children) {
      const lenType = new carouselsTypes.NumberType(false, children.leftType.dependentType.rows)
      return {
        type: lenType,
        parameters: []
      };
    }
  },
  // diagonal matrix
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'Matrix::diagonal\\(@T,<type:number@D,secret:false>\\)'
    },
    value: function (node, pathStr, children) {
      const nestedType = new carouselsTypes.ArrayType(false, children.parameters[0].copy(), children.parameters[1].dependentType.value);
      const newType = new carouselsTypes.ArrayType(false, nestedType, children.parameters[1].dependentType.value);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  // matrix matrix multiplication
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>\\*<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const l1 = children.operands[0].dependentType.length;
      const l2 = children.operands[1].dependentType.elementsType.dependentType.length;
      const secret = children.operands[0].secret || children.operands[1].secret;
      const elementsType = children.operands[1].dependentType.elementsType.dependentType.elementsType.copy();
      elementsType.secret = secret;

      const nestedType = new carouselsTypes.ArrayType(secret, elementsType, l2);
      const newType = new carouselsTypes.ArrayType(secret, nestedType, l1);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  // matrix vector multiplication
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>\\*<type:array<elementsType:<type:number@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const length = children.operands[0].dependentType.length;
      const elementsType = children.operands[1].dependentType.elementsType.copy();
      elementsType.secret = secret;
      const newType = new carouselsTypes.ArrayType(secret, elementsType, length);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  // matrix/vector plus/times scalar
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array@D,secret:(true|false)>(\\*|\\+|\\-|/)<type:number@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[0].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;
      if (newType.dependentType.elementsType.dependentType && newType.dependentType.elementsType.dependentType.elementsType) {
        newType.dependentType.elementsType.dependentType.elementsType.secret = secret;
      }

      return {
        type: newType,
        parameters: []
      };
    }
  },
  // scalar plus/times matrix/vector
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:number@D,secret:(true|false)>(\\*|\\+|\\-|/)<type:array@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[1].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;
      if (newType.dependentType.elementsType.dependentType && newType.dependentType.elementsType.dependentType.elementsType) {
        newType.dependentType.elementsType.dependentType.elementsType.secret = secret;
      }

      return {
        type: newType,
        parameters: []
      };
    }
  },
  // vector-vector|matrix-matrix addition/subtraction
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array@D,secret:(true|false)>(\\+|-)<type:array@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[0].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;
      // for matrix
      if (newType.dependentType.elementsType.dependentType && newType.dependentType.elementsType.dependentType.elementsType) {
        newType.dependentType.elementsType.dependentType.elementsType.secret = secret;
      }

      return {
        type: newType,
        parameters: []
      };
    }
  },
  // inverse
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '@T\\.inverse\\(\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  },
  // transpose
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:false>\\.transpose()'
    },
    value: function (node, pathStr, children) {
      const matType = children.leftType;
      const elementsType = matType.dependentType.elementsType.dependentType.elementsType.copy();
      const nestedType = new carouselsTypes.ArrayType(matType.secret, elementsType, matType.dependentType.length);
      const newType = new carouselsTypes.ArrayType(matType.secret, nestedType, matType.dependentType.elementsType.dependentType.length);
      return {
        type: newType,
        parameters: []
      };
    }
  }
];