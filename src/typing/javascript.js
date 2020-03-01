const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'dotExpression',
      match: '^<array@T>\\.length$',
      type: function (node, args, children) {
        // <array<type: ..., length: n>.length is of type: <number <value: n>>
        const arrayType = children.left;
        const arrayDependentType = arrayType.dependentType;

        if (arrayType.dataType === carouselsTypes.ARRAY && arrayDependentType != null && arrayDependentType.length != null) {
          const resultDependentType = new carouselsTypes.NumberDependentType(arrayDependentType.length);
          return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, resultDependentType);
        }

        return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
      }
    }
  }
];