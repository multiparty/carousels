const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const Parameter = require('./symbols/parameter.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');

const metrics = require('./metrics/metrics.js');

const IRVisitor = require('../ir/visitor.js');
const visitorImplementations = [
  require('./analysisVisitor/array.js'),
  require('./analysisVisitor/callAndReturn.js'),
  require('./analysisVisitor/expression.js'),
  require('./analysisVisitor/for.js'),
  require('./analysisVisitor/functionDefinition.js'),
  require('./analysisVisitor/if.js'),
  require('./analysisVisitor/oblivIf.js'),
  require('./analysisVisitor/value.js'),
  require('./analysisVisitor/variable.js'),
  require('./analysisVisitor/sequence.js')
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
  this.costs = new CostRuleBook(this, costs);

  // description of every encountered parameters
  this.parameters = {};
  for (let i = 0; i < costs['parameters'].length; i++) {
    const parameter = costs['parameters'][i];
    this.parameters[parameter['symbol']] = new Parameter(parameter['symbol'], parameter['description']);
  }

  // Scoped tables
  this.variableTypeMap = new ScopedMap();
  this.variableMetricMap = {};

  this.functionTypeMap = new ScopedMap();
  this.functionReturnAbstractionMap = new ScopedMap();
  this.functionMetricAbstractionMap = {};
  this.abstractionToClosedFormMap = {};

  // Metrics tables
  this.metrics = {};
  this.metricsDescription = {};
  for (let i = 0; i < costs.metrics.length; i++) {
    const metric = costs.metrics[i];
    this.metricsDescription[metric.title] = metric.description;
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

Analyzer.prototype.addParameters = function (parameters) {
  for (let i = 0; i < parameters.length; i++) {
    this.parameters[parameters[i].mathSymbol.toString()] = parameters[i];
  }
};

Analyzer.prototype.getParametersBySymbol = function (symbols) {
  const self = this;
  return symbols.map(function (symbol) {
    return symbol ? self.parameters[symbol.toString()] : null;
  });
};

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

Analyzer.prototype.removeScope = function () {
  const self = this;

  this.variableTypeMap.removeScope();
  this.functionTypeMap.removeScope();
  this.functionReturnAbstractionMap.removeScope();
  this.mapMetrics(function (metric) {
    self.variableMetricMap[metric].removeScope();
    self.functionMetricAbstractionMap[metric].removeScope();
  });
};

Analyzer.prototype.analyze = function () {
  const result = this.visitor.start(this.IR, '');
  console.log(this);
  return this.mapMetrics(function (metricTitle) {
    return result.metrics[metricTitle].toString();
  });
};

module.exports = Analyzer;