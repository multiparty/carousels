const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'DotExpression',
      match: '<type:array@D,secret:(true|false)>\\.length'
    },
    value: function (node, pathStr, children) {
      // <array<type: ..., length: n>.length is of type: <number <value: n>>
      const arrayType = children.left;
      if (arrayType.is(carouselsTypes.TYPE_ENUM.ARRAY) && arrayType.hasDependentType('length')) {
        const arrayDependentType = arrayType.dependentType;
        const resultDependentType = new carouselsTypes.ValueDependentType(arrayDependentType.length);
        return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, resultDependentType);
      }

      return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
    }
  }
];