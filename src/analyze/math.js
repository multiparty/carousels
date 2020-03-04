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
  return 'iff(' + condition.toString() + ',' + ifVal.toString() + ',' + elseVal.toString() +')';
};

module.exports = {
  parse: mathjs.parse,
  ZERO: ZERO,
  add: operatorNode('+', 'add', ZERO),
  sub: operatorNode('-', 'subtract', ZERO),
  multiply: operatorNode('*', 'multiply', ZERO),
  div: operatorNode('/', 'divide', ZERO),
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