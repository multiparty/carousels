const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const Parameter = require('./symbols/parameter.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');

const metricObjects = require('./metrics/metrics.js');

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
  this.typings = new TypingRuleBook(this, typingRules);

  // Scoped tables
  this.variableTypeMap = new ScopedMap();
  this.variableMetricMap = new ScopedMap();
  this.functionTypeMap = new ScopedMap();
  this.functionReturnAbstractionMap = new ScopedMap();
  this.functionMetricAbstractionMap = new ScopedMap();
  this.abstractionToClosedFormMap = {};

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

Analyzer.prototype.analyze = function (costs, metricTitle) {
  // costs parsing
  this.costs = new CostRuleBook(this, costs, metricTitle);

  // description of every encountered parameters
  this.parameters = {};
  for (let i = 0; i < costs['parameters'].length; i++) {
    const parameter = costs['parameters'][i];
    this.parameters[parameter['symbol']] = new Parameter(parameter['symbol'], parameter['description']);
  }

  // Metric object and title
  this.metric = null;
  this.metricTitle = metricTitle;
  for (let i = 0; i < costs.metrics.length; i++) {
    const metricEntry = costs.metrics[i];
    if (metricEntry.title === metricTitle) {
      this.metric = metricObjects[metricEntry.type];
    }
  }

  if (this.metric == null) {
    throw new Error('Unrecognized metric "' + metricTitle + '"!');
  }

  // start the visitor pattern
  this.visitor.start(this.IR, '');
  console.log(this);
};

Analyzer.prototype.symbolicResult = function () {
  const equations = [];
  const description = [];

  console.log(this.functionMetricAbstractionMap.scopes[0]);
  for (let funcName in this.functionMetricAbstractionMap.scopes[0]) {
    if (Object.prototype.hasOwnProperty.call(this.functionMetricAbstractionMap.scopes[0], funcName)) {
      const functionAbstraction = this.functionMetricAbstractionMap.scopes[0][funcName];

      const absStr = functionAbstraction.mathSymbol.toString();
      equations.push(absStr + ' = ' + this.abstractionToClosedFormMap[absStr].toString());
      description.push(absStr + ' : ' + functionAbstraction.toString());
    }
  }

  const parameters = [];
  for (let parameter in this.parameters) {
    parameters.push(this.parameters[parameter]);
  }

  return {
    description: description,
    equations: equations,
    parameters: parameters
  };
};

module.exports = Analyzer;