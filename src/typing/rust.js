const carouselsTypes = require('../analyze/symbols/types.js');
const math = require('../analyze/math.js');

const OPERATOR_MAP = {
  '+': math.add,
  '-': math.sub,
  '*': math.multiply,
  '/': math.div,
  '%': math.mod,
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
  // .len() returns lengths
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
  // to_owned, clone is similar to identity
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '(@T\\.to_owned\\(\\))|(@T.clone\\(\\))'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  },
  // Oram is identity for now
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'Oram\\(@T\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.parameters[0],
        parameters: []
      }
    }
  },
  // P::run() turns a public value to a syntactic secret
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'P::run\\(@T\\)'
    },
    value: function (node, pathStr, children) {
      const returnType = children.parameters[0].copy();
      returnType.secret = true;
      return {
        type: returnType,
        parameters: []
      };
    }
  },
  // Vector creation
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '(Vec::with_capacity\\(@T\\))|(Vec::new\\(\\))'
    },
    value: function (node, pathStr, children) {
      const elementsType = carouselsTypes.NumberType.fromTypeNode({secret: true}, pathStr + '[elementsType]');
      const arrayType = new carouselsTypes.ArrayType(true, elementsType.type, math.ZERO);

      return {
        type: arrayType,
        parameters: elementsType.parameters
      }
    }
  },
  // push/pop side effects
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:array@D,secret:(true|false)>\\.(push|pop)\\(@T\\)'
    },
    value: function (node, pathStr, children) {
      const method = node.function.right.name;
      if (node.function.left.nodeType === 'NameExpression') {
        const arrayName = node.function.left.name;
        const operation = method === 'push' ? math.add : math.sub;

        // do not allow pushing to global undefined arrays
        let sideEffectType = this.variableTypeMap.get(arrayName);
        sideEffectType = sideEffectType.copy();
        sideEffectType.dependentType.length = operation(sideEffectType.dependentType.length, math.ONE);
        this.setTypeWithConditions(arrayName, sideEffectType);
      }

      const returnType = method === 'push' ? carouselsTypes.UNIT : children.leftType.dependentType.elementsType.copy();
      return {
        type: returnType,
        parameters: []
      }
    }
  },
  // accessing array with a secret index returns a secret
  {
    rule: {
      nodeType: 'ArrayAccess',
      match: '<type:array@D,secret:(true|false)>\\[<type:[a-zA-Z_]+@D,secret:true>\\]'
    },
    value: function (node, pathStr, children) {
      const accessType = children.array.dependentType.elementsType.copy();
      accessType.secret = true;
      return {
        type: accessType,
        parameters: []
      };
    }
  },
  // numeric direct expressions
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '@NB(\\+|-|\\*|/|%)@NB'
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