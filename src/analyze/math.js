const mathjs = require('mathjs');

const ZERO = mathjs.parse('0');

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

const evaluate = function (context, expression) {
  // Set up the parser with lazy evaluation and safe recursion
  const parser = mathjs.parser();
  parser.set('iff', function (n, above_base_case, thunk_f, base_val) {
    parser.set('n', n);
    return above_base_case ? parser.evaluate(thunk_f) : base_val;
  });

  if (Array.isArray(context)) {
    // Load all relavant functions into parser
    context.map(parser.evaluate);
  } else {
    parser.scope = context;
  }

  return {
    value: parser.evaluate(expression),
    context: parser.getAll()
  };
};

module.exports = {
  parse: mathjs.parse,
  evaluate: evaluate,
  ZERO: ZERO,
  add: operatorNode('+', 'add', ZERO),
  sub: operatorNode('-', 'subtract', ZERO),
  multiply: operatorNode('*', 'multiply', ZERO),
  div: floorDiv,
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


// For testing
const get_rec_def = function (recurance, conditions) {
  const fn = mathjs.parse(recurance);
  const name = fn.name;
  const param = fn.params[0];
  const expr = fn.expr;

  const [fc, f_c] = mathjs.parse(conditions.split('='));  // f(c)
  const c = fc.args[0];

  // Eg. f     (    n    ) = iff(    n    ,     n    >=  1  , "f(n/2)+1",    0   )
  return name+'('+param+') = iff('+param+', '+param+'>='+c+', "'+expr+'", '+f_c+')';
};
const test_evaluate = function () {
  // g and f are the same function
  const def_f = get_rec_def('f(n) = f(n/2)+1', 'f(1) = 0');
  const def_g = 'g(n) = iff(n, n>=1, "g(n/2)+1", 0)';
  const f_8 = evaluate([def_f, def_g], 'f(8)').value;

  console.log(f_8);
};