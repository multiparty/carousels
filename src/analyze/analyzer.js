const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');

const metrics = require('./metrics/metrics.js');

const IRVisitor = require('../ir/visitor.js');
const visitorImplementations = [
  require('./visitors/array.js'),
  require('./visitors/expression.js'),
  require('./visitors/for.js'),
  require('./visitors/function.js'),
  require('./visitors/if.js'),
  require('./visitors/oblivIf.js'),
  require('./visitors/value.js'),
  require('./visitors/variable.js'),
  require('./visitors/sequence.js')
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
  this.variableMetricMap = {};

  this.functionTypeMap = new ScopedMap();
  this.functionReturnAbstractionMap = new ScopedMap();
  this.functionMetricAbstractionMap = {};
  this.abstractionToClosedFormMap = {};

  // Metrics tables
  this.metrics = {};
  for (let i = 0; i < costs.metrics.length; i++) {
    const metric = costs.metrics[i];
    this.metrics[metric.title] = metrics[metric.type];
    this.variableMetricMap[metric.title] = new ScopedMap();
    this.functionMetricAbstractionMap[metric.title] = new ScopedMap();
  }

  // visitor pattern
  this.visitor = new IRVisitor({ analyzer: this });
  for (let i = 0; i < visitorImplementations.length; i++) {
    this.visitor.addVisitors(visitorImplementations[i]);
  }
}

Analyzer.prototype.mapMetrics = function (lambda) {
  const result = {};
  for (let metricTitle in this.metrics) {
    if (!Object.prototype.hasOwnProperty.call(this.metrics, metricTitle)) {
      continue;
    }
    result[metricTitle] = lambda(metricTitle, this.metrics[metricTitle]);
  }
  return result;
};

Analyzer.prototype.analyze = function () {
  const result = this.visitor.start(this.IR);
  return this.mapMetrics(function (metricTitle) {
    return result.metrics[metricTitle].toString();
  });
};

module.exports = Analyzer;