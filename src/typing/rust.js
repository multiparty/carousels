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
  // to_owned, clone, into is similar to identity
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '(@T\\.to_owned\\(\\))|(@T.clone\\(\\))|(@T\\.into\\(\\))'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  },
  // Concat of two arrays
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:array@D,secret:(true|false)>\\.concat\\(@T\\)'
    },
    value: function (node, pathStr, children) {
      const thisType = children.leftType;
      const argType = children.parameters[0];

      const finalType = thisType.copy();
      finalType.secret = thisType.secret || argType.secret;
      finalType.dependentType.length = math.add(thisType.dependentType.length, math.ONE);
      if (thisType.dependentType.elementsType.dataType !== argType.dataType) {
        finalType.dependentType.elementsType.dataType = carouselsTypes.AnyType(thisType.secret || argType.secret);
      }

      return {
        type: finalType,
        parameters: []
      }
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
  },
  // uniary minus
  {
    rule: {
      nodeType: 'DirectExpression',
      match: '~@NB'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret;
      let val = math.unaryMinus(children.operands[0].dependentType.value);
      return {
        type: new carouselsTypes.NumberType(secret, val),
        parameters: []
      };
    }
  },
  /* Matrix operations */
  { // inverse, copy, and sqrt
    rule: {
      nodeType: 'FunctionCall',
      match: '(@T\\.copy\\(\\))|(@T\\.sqrt\\(\\))|(@T\\.inverse\\(\\))'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  },
  { // diagonal matrix
    rule: {
      nodeType: 'FunctionCall',
      match: 'Matrix::diagonal\\(@T,<type:number@D,secret:false>\\)'
    },
    value: function (node, pathStr, children) {
      const nestedType = new carouselsTypes.ArrayType(false, children.parameters[0].copy(), children.parameters[1].dependentType.value);
      const newType = new carouselsTypes.ArrayType(false, nestedType, children.parameters[1].dependentType.value);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  { // vector of ones
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
  { // transpose
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:false>\\.transpose()'
    },
    value: function (node, pathStr, children) {
      const matType = children.leftType;
      const elementsType = matType.dependentType.elementsType.dependentType.elementsType.copy();
      const nestedType = new carouselsTypes.ArrayType(matType.secret, elementsType, matType.dependentType.length);
      const newType = new carouselsTypes.ArrayType(matType.secret, nestedType, matType.dependentType.elementsType.dependentType.length);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  { // matrix matrix multiplication
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>\\*<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const l1 = children.operands[0].dependentType.length;
      const l2 = children.operands[1].dependentType.elementsType.dependentType.length;
      const secret = children.operands[0].secret || children.operands[1].secret;
      const elementsType = children.operands[1].dependentType.elementsType.dependentType.elementsType.copy();
      elementsType.secret = secret;

      const nestedType = new carouselsTypes.ArrayType(secret, elementsType, l2);
      const newType = new carouselsTypes.ArrayType(secret, nestedType, l1);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  { // matrix vector multiplication
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array<elementsType:<type:array@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>\\*<type:array<elementsType:<type:number@D,secret:(true|false)>,length:(.*)>,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const length = children.operands[0].dependentType.length;
      const elementsType = children.operands[1].dependentType.elementsType.copy();
      elementsType.secret = secret;
      const newType = new carouselsTypes.ArrayType(secret, elementsType, length);
      return {
        type: newType,
        parameters: []
      };
    }
  },
  { // vector-vector inner product
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
  },
  { // vector/matrix plus/times number
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array@D,secret:(true|false)>(\\*|\\+|\\-|/)<type:number@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[0].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;
      if (newType.dependentType.elementsType.dependentType && newType.dependentType.elementsType.dependentType.elementsType) {
        newType.dependentType.elementsType.dependentType.elementsType.secret = secret;
      }

      return {
        type: newType,
        parameters: []
      };
    }
  },
  { // number plus/times vector/matrix
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:number@D,secret:(true|false)>(\\*|\\+|\\-|/)<type:array@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[1].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;
      if (newType.dependentType.elementsType.dependentType && newType.dependentType.elementsType.dependentType.elementsType) {
        newType.dependentType.elementsType.dependentType.elementsType.secret = secret;
      }

      return {
        type: newType,
        parameters: []
      };
    }
  },
  { // vector-vector|matrix-matrix addition/subtraction
    rule: {
      nodeType: 'DirectExpression',
      match: '<type:array@D,secret:(true|false)>(\\+|-)<type:array@D,secret:(true|false)>'
    },
    value: function (node, pathStr, children) {
      const secret = children.operands[0].secret || children.operands[1].secret;
      const newType = children.operands[0].copy();
      newType.secret = secret;
      newType.dependentType.elementsType.secret = secret;
      // for matrix
      if (newType.dependentType.elementsType.dependentType && newType.dependentType.elementsType.dependentType.elementsType) {
        newType.dependentType.elementsType.dependentType.elementsType.secret = secret;
      }

      return {
        type: newType,
        parameters: []
      };
    }
  }
];