const _mathjs = require('mathjs');
const mathjs = _mathjs.create(_mathjs.all);

// constants
const ZERO = mathjs.parse('0');
const ONE = mathjs.parse('1');
const TRUE = mathjs.parse('true');
const ERROR = mathjs.parse('__error()');

// functions used to create symbolic expressions (e.g. x + y)
const not = function (argument) {
  return new mathjs.OperatorNode('not', 'not', [argument]);
};
const emptyArgs = function (_arguments) {
  return _arguments.length === 0 || _arguments[0] == null;
};
const operatorNode = function (operator, description, identity) {
  return function () {
    if (emptyArgs(arguments)) {
      if (identity === undefined) {
        throw new Error('Mathjs operator "' + operator + '" has no identity and is called without arguments!');
      }
      return identity;
    }
    if (arguments.length === 1) {
      return arguments[0];
    }
    return new mathjs.OperatorNode(operator, description, Array.from(arguments));
  };
};
const floorDiv = function (x, y) {
  return new mathjs.FunctionNode('floor', [operatorNode('/', 'divide', ZERO)(x, y)]);
};
const ceilDiv = function (x, y) {
  return new mathjs.FunctionNode('ceil', [operatorNode('/', 'divide', ZERO)(x, y)]);
};
const max = function () {
  if (emptyArgs(arguments)) {
    return ZERO;
  }
  if (arguments.length === 1) {
    return arguments[0];
  }
  return new mathjs.FunctionNode('max', Array.from(arguments));
};
const iff = function (condition, ifVal, elseVal) {
  return new mathjs.FunctionNode('iff', [condition, ifVal, elseVal]);
};

// functions used to parse and evaluate complex and recursive symbolic system of equations
const evaluate = (function () {
  /* Memoized ternary if else */
  let mem = {};
  let mem_size = 0;
  const MAX_MEM = 10000000;
  const iffInterpreter = function (args, _, scope) {
    // const memotag = Object.keys(scope) + JSON.stringify(scope);//args.map(String).join('') + JSON.stringify(scope);
    // let memo = mem[memotag];
    // console.log('iff args', args.map(String).join(' :: '));
    // if (memo === undefined) {
      const [condition, _if, _else] = args;
      memo = condition.evaluate(scope) ? _if.evaluate(scope) : _else.evaluate(scope);
    //   mem[memotag] = memo;
    //   mem_size++;
    //   if (mem_size > MAX_MEM) {
    //     console.log('/carousels/src/analyze/math.js:62\t\tflush cache');
    //     new Warning('Memo Cache Flushed');
    //     mem = {};
    //   }
    //   // console.log('memo created');
    //   console.log('condition if else', condition, _if, _else);
    //   stats.created++;
    // } else {
    //   // console.log('memo used');
    //   stats.used++;
    // }
    // console.log(stats, mem_size, memotag, memo);
    return memo;
  };
  iffInterpreter.rawArgs = true;

  /* parse by name mathjs */
  mathjs.import({iff: iffInterpreter});  // Load the lazily evaluated definition

  /* Evaluate expression in context */
  const evaluate = function (callExpression, atPoints, context) {
    const parser = mathjs.parser();
    context.forEach(function (c) {
      parser.evaluate(c);
    });

    const evalParameter = Object.keys(atPoints)[0];
    const regex = new RegExp('(,|\\()[ ]*' + evalParameter + '[ ]*(,|\\))');
    const parameterIsAnArgument = callExpression.match(regex);

    const evalValues = [];
    for (let i = 0; i < atPoints[evalParameter].length; i++) {
      const val = atPoints[evalParameter][i];
      if (parameterIsAnArgument) {
        evalValues.push(parser.evaluate(callExpression.replace(evalParameter, val)));
      } else {
        parser.evaluate(evalParameter + '=' + val);
        evalValues.push(parser.evaluate(callExpression));
      }
    }

    return evalValues;
  };

  return evaluate;
})();

// check if variable appear as a *free* variable in expression
const variableIsUsed = function (variable, expression) {
  let found = false;
  const boundAttr = '_carousels_bound' + variable;
  expression.traverse(function (node, path, parent) {
    switch (node.type) {
      case 'AccessorNode':
      case 'ArrayNode':
      case 'ConditionalNode':
      case 'ConstantNode':
      case 'FunctionNode':
      case 'IndexNode':
      case 'ObjectNode':
      case 'OperatorNode':
      case 'ParenthesisNode':
      case 'RangeNode':
      case 'RelationalNode':
        if (parent[boundAttr]) {
          node[boundAttr] = parent[boundAttr];
        }
        break;

      case 'FunctionAssignmentNode':
        if (node.params.indexOf(variable) > -1) {
          // not a free variable
          node[boundAttr] = true;
        }
        break;
      case 'SymbolNode':
        if (parent[boundAttr] !== true && node.name === variable) {
          found = true;
        }
        break;

      case 'AssignmentNode':
      case 'BlockNode':
      default:
        throw new Error('Unsupported node type "' + node.type + '" in mathjs expression!');
    }
  });

  return found;
};

var hotpatch = function (lib = mathjs) {
  var _array = {};
  _array.forEach = function (array, callback) {
    Array.prototype.forEach.call(array, callback)
  };
  _array.join = function (array, separator) {
    return Array.prototype.join.call(array, separator)
  };

  var _customs = {};
  _customs.setSafeProperty = function (object, prop, value) {
    var isPlainObject = function (object) {
      return typeof object === 'object' && object && object.constructor === Object;
    };

    var isSafeProperty = function (object, prop) {
      if (!object || typeof object !== 'object') {
        return false
      }
      if (prop === 'name' || prop === 'length') {
        return true
      }
      if (prop in Object.prototype) {
        return false
      }
      if (prop in Function.prototype) {
        return false
      }
      return true
    };

    // only allow setting safe properties of a plain object
    if (isPlainObject(object) && isSafeProperty(object, prop)) {
      object[prop] = value
      return value
    }

    throw new Error('No access to property "' + prop + '"')
  }

  lib.FunctionAssignmentNode.prototype._compile = function (math, argNames) {
    var childArgNames = Object.create(argNames);
    (0, _array.forEach)(this.params, function (param) {
      childArgNames[param] = true;
    }); // compile the function expression with the child args

    var evalExpr = this.expr._compile(math, childArgNames);

    var name = this.name;
    var params = this.params;
    var signature = (0, _array.join)(this.types, ',');
    var syntax = name + '(' + (0, _array.join)(this.params, ', ') + ')';
    return function evalFunctionAssignmentNode(scope, args, context) {
      var signatures = {};
      var cache = {empty: true, mem: []};

      signatures[signature] = function () {
        var childArgs = Object.create(args);
        var argstring = "";

        for (var i = 0; i < params.length; i++) {
          childArgs[params[i]] = arguments[i];
        }

        var call = name + JSON.stringify(childArgs) + JSON.stringify(scope);
        var result = cache[call];
        console.log('result', result);

        if (result === undefined) {
          console.log('no memo');
          result = evalExpr(scope, childArgs, context);
        } else {
          console.log('got the memo');
        }

        console.log('call', call);
        console.log('cache', cache);

        cache[call] = result;

        return result;
      };

      var fn = lib.typed(name, signatures);
      fn.syntax = syntax;
      fn.cache = cache;
      (0, _customs.setSafeProperty)(scope, name, fn);
      return fn;
    };
  };
  console.log('patched');
};

module.exports = {
  parse: mathjs.parse,
  simplify: mathjs.simplify,
  evaluate: evaluate,
  variableIsUsed: variableIsUsed,
  ZERO: ZERO,
  ONE: ONE,
  TRUE: TRUE,
  ERROR: ERROR,
  add: operatorNode('+', 'add', ZERO),
  sub: operatorNode('-', 'subtract', ZERO),
  multiply: operatorNode('*', 'multiply', ZERO),
  and: operatorNode('and', 'and', TRUE),
  or: operatorNode('or', 'or', TRUE),
  div: floorDiv,
  mod: operatorNode('%', 'mod'),
  ceilDiv: ceilDiv,
  gt: operatorNode('>', 'larger', ZERO),
  lt: operatorNode('<', 'smaller', ZERO),
  gte: operatorNode('>=', 'largerEq', ZERO),
  lte: operatorNode('<=', 'smallerEq', ZERO),
  eq: operatorNode('==', 'equal', ZERO),
  neq: operatorNode('!=', 'Unequal', ZERO),
  not: not,
  max: max,
  iff: iff
};
// https://mathjs.org/docs/expressions/syntax.html

hotpatch(mathjs);
