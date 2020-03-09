const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const Parameter = require('./symbols/parameter.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');

const metricObjects = require('./metrics/metrics.js');

const IRVisitor = require('../ir/visitor.js');
const visitorImplementations = [
  require('./analysis/array.js'),
  require('./analysis/callAndReturn.js'),
  require('./analysis/expression.js'),
  require('./analysis/for.js'),
  require('./analysis/functionDefinition.js'),
  require('./analysis/if.js'),
  require('./analysis/oblivIf.js'),
  require('./analysis/value.js'),
  require('./analysis/variable.js'),
  require('./analysis/sequence.js')
];

const StringifyVisitor = require('./helpers/stringify.js');

function Analyzer(language, code, costs, extraTyping) {
  this.language = language;
  this.code = code;
  this.intermediateResults = [];

  // parse into IR
  const parser = parsers[this.language];
  this.IR = parser(this.code);

  // typing rules
  const typingRules = (extraTyping || []).concat(typings[this.language]);
  this.typings = new TypingRuleBook(this, typingRules);

  // Scoped tables
  this.variableTypeMap = new ScopedMap(); // also functions
  this.variableMetricMap = new ScopedMap();
  this.functionReturnAbstractionMap = new ScopedMap();
  this.functionMetricAbstractionMap = new ScopedMap();
  this.abstractionToClosedFormMap = {};

  // visitor pattern
  this.visitor = new IRVisitor({ analyzer: this });
  for (let i = 0; i < visitorImplementations.length; i++) {
    this.visitor.addVisitors(visitorImplementations[i]);
  }

  // Stores intermediate results/history in order of visit!
  const self = this;
  this.visitor.visit = function (node) {
    try {
      const result = IRVisitor.prototype.visit.apply(self.visitor, arguments);
      self.intermediateResults.push({node: node, result: result});
      return result;
    } catch (error) {
      if (!error.__analyzed) {
        error.__analyzed = true;
        if (error.__IRNODE) {
          node = error.__IRNODE;
        }
        self.intermediateResults.push({node: node, error: error});
      }
      throw error;
    }
  };
}

// Symbolic parameters management
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

// Main entry point
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
};

// Retrieves the symbolic result: this can be plotted or displayed
Analyzer.prototype.symbolicResult = function () {
  const equations = [];
  const description = [];

  for (let funcName in this.functionMetricAbstractionMap.scopes[0]) {
    if (Object.prototype.hasOwnProperty.call(this.functionMetricAbstractionMap.scopes[0], funcName)) {
      const functionAbstraction = this.functionMetricAbstractionMap.scopes[0][funcName];

      const absStr = functionAbstraction.mathSymbol.toString();
      equations.push(absStr + ' = ' + this.abstractionToClosedFormMap[absStr].toString());
      description.push(functionAbstraction.toString());
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

// returns a string with the IR code (pretty formatted) with the metric, typing, and error annotations embedded in it for debugging
Analyzer.prototype.prettyPrint = function (withAnnotation, HTML) {
  const debuggingVisitor = new StringifyVisitor(withAnnotation !== false ? this.intermediateResults : null, HTML);
  return debuggingVisitor.start(this.IR);
};

// Exports
module.exports = Analyzer;