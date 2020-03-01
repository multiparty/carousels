const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');

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

function Analyzer(language, code, costs, extraTyping) {
  this.language = language;
  this.code = code;

  // parse into IR
  const parser = parsers[this.language];
  this.IR = parser(this.code);

  // typing rules
  const typingRules = (extraTyping || []).concat(typings[this.language]);
  this.typings = new TypingRuleBook(typingRules);

  // costs parsing
  this.costs = new CostRuleBook(costs);

  // Scoped tables
  this.variableTypeMap = new ScopedMap();
  this.functionTypeMap = new ScopedMap();
  this.functionDependentTypeMap = new ScopedMap();
  this.functionMetricMap = new ScopedMap();
  this.functionSymbolEquationMap = new ScopedMap();

  // visitor pattern
  this.visitor = new IRVisitor(this);
  for (let i = 0; i < visitorImplementations.length; i++) {
    this.visitor.addVisitors(visitorImplementations[i]);
  }
}

Analyzer.prototype.analyze = function () {
  this.visitor.start(this.IR);
  return 'b*2';
};

module.exports = Analyzer;