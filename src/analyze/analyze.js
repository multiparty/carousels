const IRVisitor = require('../ir/visitor.js');
const visitorImplementations = [
  require('./visitors/array.js'),
  require('./visitors/expression.js'),
  require('./visitors/for.js'),
  require('./visitors/function.js'),
  require('./visitors/if.js'),
  require('./visitors/oblivIf.js'),
  require('./visitors/value.js'),
  require('./visitors/variable.js')
];

const analyze = function (IR, costs) {
  const visitor = new IRVisitor(IR);
  for (let i = 0; i < visitorImplementations.length; i++) {
    visitor.addVisitors(visitorImplementations[i]);
  }
  visitor.start();

  return 'b*2';
};

module.exports = analyze;