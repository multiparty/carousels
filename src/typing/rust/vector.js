const carouselsTypes = require('../../analyze/symbols/types.js');
const math = require('../../analyze/math.js');

module.exports = [
  // vector of ones
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'Vector::ones\\(<type:number@D,secret:false>\\)'
    },
    value: function (node, pathStr, children) {
      const newType = new carouselsTypes.ArrayType(false, new carouselsTypes.NumberType(false, math.ONE), children.parameters[0].dependentType.value);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  // vector-vector inner product
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array<elementsType:<type:number@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>\\*<type:array<elementsType:<type:number@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const elementsType = children.operands[0].dependentType.elementsType.copy();
      elementsType.secret = children.operands[0].secret || children.operands[1].secret;
      return {
        type: elementsType,
        parameters: []
      };
    }
  }
];