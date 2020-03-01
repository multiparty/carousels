const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'dotExpression',
      match: '^<array@T>\\.len$',
      type: function (node, args, children) {
        const arrayType = children.left;
        const arrayDependentType = arrayType.dependentType;

        if (arrayType.dataType !== carouselsTypes.ARRAY || arrayDependentType == null || arrayDependentType.length == null) {
          const plainNumberType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
          return new carouselsTypes.FunctionType(null, [], plainNumberType);
        }

        // <array>.len() is of type: < <array <type: any, length: n>>() => <number <value: n> >
        const returnDependentType = new carouselsTypes.NumberDependentType(arrayDependentType.length);
        const returnType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, returnDependentType);

        return new carouselsTypes.FunctionType(arrayType, [], returnType);
      }
    },
  }
];