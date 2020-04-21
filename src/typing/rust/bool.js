const carouselsTypes = require('../../analyze/symbols/types.js');
const math = require('../../analyze/math.js');

const OPERATOR_MAP = {
  '<': math.lt,
  '<=': math.lte,
  '>': math.gt,
  '>=': math.gte,
  '==': math.eq,
  '!-': math.neq,
  '&&': math.and,
  '||': math.or
};

module.exports = [
  // bool and relational direct expression
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '@NB(<|>|(<=)|(>=)|(==)|(!=)|(&&)|(\\|\\|))@NB'
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