const mathjs = require('mathjs');

const ZERO = mathjs.parse('0');

const emptyArgs = function (_arguments) {
  return _arguments.length === 0 || _arguments[0] == null;
};

const add = function () {
  if (emptyArgs(arguments)) {
    return ZERO;
  }
  if (arguments.length === 1) {
    return arguments[0];
  }
  return new mathjs.OperatorNode('+', 'add', Array.from(arguments));
};

const multiply = function () {
  if (emptyArgs(arguments)) {
    return ZERO;
  }
  if (arguments.length === 1) {
    return arguments[0];
  }
  return new mathjs.OperatorNode('*', 'multiply', Array.from(arguments));
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

module.exports = {
  parse: mathjs.parse,
  ZERO: ZERO,
  add: add,
  multiply: multiply,
  max: max
};