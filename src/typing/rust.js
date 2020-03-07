const carouselsTypes = require('../analyze/symbols/types.js');
const math = require('../analyze/math.js');

const OPERATOR_MAP = {
  '+': math.add,
  '-': math.sub,
  '*': math.multiply,
  '/': math.div,
  '<': math.lt,
  '<=': math.lte,
  '>': math.gt,
  '>=': math.gte,
  '==': math.eq,
  '!-': math.neq
};

module.exports = [
  {
    rule: {
      nodeType: 'DotExpression',
      match: '<type:array@D,secret:(true|false)>\\.len'
    },
    value: function (node, pathStr, children) {
      const arrayType = children.left;

      // <array>.len() is of type: < <array <elementsType: any, length: n>>() => <number <value: n> >
      const returnType = new carouselsTypes.NumberType(false, arrayType.dependentType.length);
      return {
        type: new carouselsTypes.FunctionType(arrayType, [], returnType),
        parameters: []
      };
    }
  },
  // to_owned is similar to identity
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '@T\\.to_owned\\(\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  },
  // numeric direct expressions
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '@NB(\\+|-|\\*|/)@NB'
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
  // boolean direct expression
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '@NB(<|>|(<=)|(>=)|(==)|(!=))@NB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const mathOperator = OPERATOR_MAP[node.operator];
      const val = mathOperator(children.operands[0].dependentType.value, children.operands[1].dependentType.value);

      return {
        type: new carouselsTypes.BooleanType(secret, val),
        parameters: []
      }
    }
  },
  // not
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '!@NB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret;
      let val = math.not(children.operands[0].dependentType.value);
      return {
        type: new carouselsTypes.BooleanType(secret, val),
        parameters: []
      };
    }
  }
];