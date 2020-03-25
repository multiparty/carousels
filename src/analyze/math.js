const _mathjs = require('mathjs');
const mathjs = _mathjs.create(_mathjs.all);

// constants
const ZERO = mathjs.parse('0');
const ONE = mathjs.parse('1');

// functions used to create symbolic expressions (e.g. x + y)
const emptyArgs = function (_arguments) {
  return _arguments.length === 0 || _arguments[0] == null;
};
const operatorNode = function (operator, description, identity) {
  return function () {
    if (emptyArgs(arguments)) {
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
    const memotag = args.map(String).join('') + JSON.stringify(scope);
    let memo = mem[memotag];
    if (memo === undefined) {
      const [condition, _if, _else] = args;
      memo = condition.evaluate(scope) ? _if.evaluate(scope) : _else.evaluate(scope);
      mem[memotag] = memo;
      mem_size++;
      if (mem_size > MAX_MEM) {
        mem = {};
      }
    }
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

module.exports = {
  parse: mathjs.parse,
  simplify: mathjs.simplify,
  evaluate: evaluate,
  ZERO: ZERO,
  ONE: ONE,
  add: operatorNode('+', 'add', ZERO),
  sub: operatorNode('-', 'subtract', ZERO),
  multiply: operatorNode('*', 'multiply', ZERO),
  div: floorDiv,
  ceilDiv: ceilDiv,
  gt: operatorNode('>', 'larger', ZERO),
  lt: operatorNode('<', 'smaller', ZERO),
  gte: operatorNode('>=', 'largerEq', ZERO),
  lte: operatorNode('<=', 'smallerEq', ZERO),
  eq: operatorNode('==', 'equal', ZERO),
  neq: operatorNode('!=', 'Unequal', ZERO),
  not: operatorNode('not', 'not', ZERO),
  max: max,
  iff: iff
};
// https://mathjs.org/docs/expressions/syntax.html