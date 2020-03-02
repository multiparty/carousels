const mathjs = require('mathjs');

const add = function () {
  return new mathjs.OperatorNode('+', 'add', Array.from(arguments));
};

const multiply = function () {
  return new mathjs.OperatorNode('*', 'multiply', Array.from(arguments));
};

const max = function () {
  return new mathjs.FunctionNode('max', Array.from(arguments));
};

module.exports = {
  parse: mathjs.parse,
  ZERO: mathjs.parse('0'),
  add: add,
  multiply: multiply,
  max: max
};