const carouselsTypes = require('../../analyze/symbols/types.js');
const math = require('../../analyze/math.js');

const OPERATOR_MAP = {
  '+': math.add,
  '-': math.sub,
  '*': math.multiply,
  '/': math.div,
  '%': math.mod
};

module.exports = [
  // numeric direct expressions
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '@NB(\\+|-|\\*|/|%)@NB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const mathOperator = OPERATOR_MAP[node.operator];
      const val = mathOperator(children.operands[0].dependentType.value, children.operands[1].dependentType.value);

      return {
        type: new carouselsTypes.NumberType(secret, val),
        parameters: []
      }
    }
  },
  // uniary minus
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '~@NB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret;
      let val = math.unaryMinus(children.operands[0].dependentType.value);
      return {
        type: new carouselsTypes.NumberType(secret, val),
        parameters: []
      };
    }
  },
  // sqrt
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '@T\\.sqrt\\(\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  }
];