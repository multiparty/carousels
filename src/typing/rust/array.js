const carouselsTypes = require('../../analyze/symbols/types.js');
const Parameter = require('../../analyze/symbols/parameter.js');
const math = require('../../analyze/math.js');

module.exports = [
  // array creation (for now all such arrays are defined to contain numbers)
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '(Vec::with_capacity\\(@T\\))|(Vec::new\\(\\))'
    },
    value: function (node, pathStr, children) {
      const parameter = Parameter.forValue(pathStr + '[elementsType]');
      const elementsType = new carouselsTypes.NumberType(true, parameter.mathSymbol);
      const arrayType = new carouselsTypes.ArrayType(true, elementsType, math.ZERO);

      return {
        type: arrayType,
        parameters: [parameter]
      }
    }
  },
  // .len() returns length
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
  // swap elements in array returns array
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:array@D,secret:(true|false)>\\.swap\\(@T,@T\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  }
];