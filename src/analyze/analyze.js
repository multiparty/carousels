const mathjs = require('mathjs');
const IRVisitor = require('./visitor.js');

const analyze = function (IR, costs) {
  const visitor = new IRVisitor(IR);
  visitor.start();

  return mathjs.parse('b*2');
};

module.exports = analyze;