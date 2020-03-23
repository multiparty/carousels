const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'DotExpression',
      match: '<type:array@D,secret:(true|false)>\\.length'
    },
    value: function (node, pathStr, children) {
      // <array<elementsType: ..., length: n>.length is of type: <number <value: n>>
      return {
        type: new carouselsTypes.NumberType(false, children.left.dependentType.length),
        parameters: []
      };
    }
  }
];