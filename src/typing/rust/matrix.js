const carouselsTypes = require('../../analyze/symbols/types.js');

module.exports = [
  // .len() of a matrix returns row count
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:matrix@D,secret:(true|false)>\\.len\\(\\)'
    },
    value: function (node, pathStr, children) {
      const lenType = new carouselsTypes.NumberType(false, children.leftType.dependentType.rows);
      return {
        type: lenType,
        parameters: []
      };
    }
  },
  // append a vector to a matrix
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:matrix@D,secret:(true|false)>\\.append\\(<type:matrix@D,secret:(true|false)>\\)'
    },
    value: function (node, pathStr, children) {
      const secret = children.leftType.secret || children.parameters[0].secret;
      const rows = children.leftType.dependentType.rows;
      const cols = children.leftType.dependentType.cols;
      const elementsType = children.leftType.dependentType.elementsType.copy();
      elementsType.secret = secret;

      return {
        type: new carouselsTypes.MatrixType(secret, elementsType, rows + '+1', cols),
        parameters: []
      };
    }
  },
  // transpose
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:matrix@D,secret:(true|false)>\\.transpose\\(\\)'
    },
    value: function (node, pathStr, children) {
      const secret = children.leftType.secret;
      const elementsType = children.leftType.dependentType.elementsType.copy();
      const rows = children.leftType.dependentType.rows;
      const cols = children.leftType.dependentType.cols;

      return {
        type: new carouselsTypes.MatrixType(secret, elementsType, cols, rows),
        parameters: []
      };
    }
  },
  // inverse: identity
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:matrix@D,secret:(true|false)>\\.inverse\\(\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType.copy(),
        parameters: []
      };
    }
  },
  // diagonal matrix from a vector
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'Matrix::diagonal\\(<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:(true|false)>\\)'
    },
    value: function (node, pathStr, children) {
      const secret = children.parameters[0].secret;
      const elementsType = children.parameters[0].dependentType.elementsType.copy();
      const size = children.parameters[0].dependentType.rows;

      return {
        type: new carouselsTypes.MatrixType(secret, elementsType, size, size),
        parameters: []
      };
    }
  },
  // matrix matrix multiplication
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:matrix@D,secret:(true|false)>\\*<type:matrix@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const m1 = children.operands[0];
      const m2 = children.operands[1];

      // ensure base types are the same
      const d1 = m1.dependentType.elementsType;
      const d2 = m2.dependentType.elementsType;
      if (d1.dataType !== d2.dataType) {
        throw new Error('Multiplying matrices of different base types "' + m1 + '" and "' + m2 + '" at "' + pathStr + '"!');
      }

      // dimensions
      const n1 = m1.dependentType.rows;
      const k2 = m2.dependentType.cols;
      // const k1 = m1.dependentType.cols;
      // const n2 = m2.dependentType.rows;
      // if (k1 !== n2) { // fix: string equality is not good enough for expressions ...
      //  throw new Error('Multiplying matrices of incompatible dimensions "(' + n1 + ', ' + k1 + ')" and "(' + n2 + ', ' + k2 + ')" at "' + pathStr + '"!')
      // }

      // construct pieces of the final type
      const secret = children.operands[0].secret || children.operands[1].secret;
      const elementsType = d1.copy();
      elementsType.secret = secret;

      let returnType;
      if (n1.toString() === '1' && k2.toString() === '1') {
        // special case resulting in a 1x1 matrix: i.e. single element
        returnType = elementsType;
      } else {
        returnType = new carouselsTypes.MatrixType(secret, elementsType, n1, k2);
      }

      return {
        type: returnType,
        parameters: []
      };
    }
  },
  // matrix plus/times/minus/div scalar
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:matrix@D,secret:(true|false)>(\\*|\\+|\\-|/)@NFB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[0].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;

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
      match: '@NFB(\\*|\\+|\\-|/)<type:matrix@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[1].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;

      return {
        type: newType,
        parameters: []
      };
    }
  },
  // matrix plus/minus matrix (element wise)
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:matrix@D,secret:(true|false)>(\\+|-)<type:matrix@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[0].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;

      return {
        type: newType,
        parameters: []
      };
    }
  }
];