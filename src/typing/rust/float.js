const carouselsTypes = require('../../analyze/symbols/types.js');
const Parameter = require('../../analyze/symbols/parameter.js');
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
      match: '(@F(\\+|-|\\*|/|%)@NFB)|(@NFB(\\+|-|\\*|/|%)@F)'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const mathOperator = OPERATOR_MAP[node.operator];
      const val = mathOperator(children.operands[0].dependentType.value, children.operands[1].dependentType.value);

      return {
        type: new carouselsTypes.FloatType(secret, val),
        parameters: []
      }
    }
  },
  // uniary minus
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '~@F'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret;
      let val = math.unaryMinus(children.operands[0].dependentType.value);
      return {
        type: new carouselsTypes.FloatType(secret, val),
        parameters: []
      };
    }
  },
  // sqrt
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '@F\\.sqrt\\(\\)'
    },
    value: function (node, pathStr, children) {
      const parameter = Parameter.forValue(pathStr);
      return {
        type: new carouselsTypes.FloatType(children.leftType.secret, parameter.mathSymbol),
        parameters: [parameter]
      };
    }
  },
  // power
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '@F\\.powf\\(@F\\)'
    },
    value: function (node, pathStr, children) {
      const secret = children.leftType.secret || children.parameters[0].secret;
      const parameter = Parameter.forValue(pathStr);
      return {
        type: new carouselsTypes.FloatType(secret, parameter.mathSymbol),
        parameters: [parameter]
      };
    }
  }
];