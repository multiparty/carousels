const carouselsTypes = require('../analyze/symbols/types.js');
const Parameter = require('../analyze/symbols/parameter.js');
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

const OPERATOR_OUTPUT_MAP = {
  '+': carouselsTypes.TYPE_ENUM.NUMBER,
  '-': carouselsTypes.TYPE_ENUM.NUMBER,
  '*': carouselsTypes.TYPE_ENUM.NUMBER,
  '/': carouselsTypes.TYPE_ENUM.NUMBER,
  '<': carouselsTypes.TYPE_ENUM.BOOLEAN,
  '<=': carouselsTypes.TYPE_ENUM.BOOLEAN,
  '>': carouselsTypes.TYPE_ENUM.BOOLEAN,
  '>=': carouselsTypes.TYPE_ENUM.BOOLEAN,
  '==': carouselsTypes.TYPE_ENUM.BOOLEAN,
  '!=': carouselsTypes.TYPE_ENUM.BOOLEAN
};

module.exports = [
  {
    rule: {
      nodeType: 'DotExpression',
      match: '^<array@D>\\.len$'
    },
    value: function (node, pathStr, children) {
      const arrayType = children.left;

      if (arrayType.is(carouselsTypes.TYPE_ENUM.ARRAY) && arrayType.hasDependentType('length')) {
        // <array>.len() is of type: < <array <type: any, length: n>>() => <number <value: n> >
        const arrayDependentType = arrayType.dependentType;
        const returnDependentType = new carouselsTypes.ValueDependentType(arrayDependentType.length);
        const returnType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, returnDependentType);

        return new carouselsTypes.FunctionType(arrayType, [], returnType);
      }

      const plainNumberType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
      return new carouselsTypes.FunctionType(null, [], plainNumberType);
    }
  },
  // direct expressions
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '@NB(\\+|-|\\*|/|<|>|(<=)|(>=)|(==)|(!=))@NB'
    },
    value: function (node, pathStr, children) {
      const operands = [];
      let allDependent = true;
      let secret = false;

      for (let i = 0; i < children.operands.length; i++) {
        secret = secret || children.operands[i].secret;
        if (!children.operands[i].hasDependentType('value')) {
          console.log(children.operands[i], 'has no value');
          allDependent = false;
        } else {
          operands.push(children.operands[i].dependentType.value);
        }
      }

      let dependentParameterVal;
      if (allDependent) {
        dependentParameterVal = OPERATOR_MAP[node.operator].apply(math, operands);
      } else {
        const freshParameter = Parameter.forValue(pathStr);
        this.addParameters([freshParameter]);
        dependentParameterVal = freshParameter.mathSymbol;
      }

      const dependentType = new carouselsTypes.ValueDependentType(dependentParameterVal);
      return new carouselsTypes.Type(OPERATOR_OUTPUT_MAP[node.operator], secret, dependentType);
    }
  },
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '!@NB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret;
      let dependentParameterVal;

      if (children.operands[0].hasDependentType('value')) {
        dependentParameterVal = math.not(children.operands[0]);
      } else {
        const freshParameter = Parameter.forValue(pathStr);
        this.addParameters([freshParameter]);
        dependentParameterVal = freshParameter.mathSymbol;
      }

      const dependentType = new carouselsTypes.ValueDependentType(dependentParameterVal);
      return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.BOOLEAN, secret, dependentType);
    }
  }
];