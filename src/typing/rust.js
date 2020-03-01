const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'dotExpression',
      match: '^<array@T>\\.len$',
      type: function (node, args, children) {
        const arrayType = children.left;

        if (arrayType.dataType === carouselsTypes.ARRAY && arrayType.hasDependentType('length')) {
          // <array>.len() is of type: < <array <type: any, length: n>>() => <number <value: n> >
          const arrayDependentType = arrayType.dependentType;
          const returnDependentType = new carouselsTypes.NumberDependentType(arrayDependentType.length);
          const returnType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, returnDependentType);

          return new carouselsTypes.FunctionType(arrayType, [], returnType);
        }

        const plainNumberType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
        return new carouselsTypes.FunctionType(null, [], plainNumberType);
      }
    },
  }
];