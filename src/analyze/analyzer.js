const SymbolicOutput = require('./output.js');

const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const Parameter = require('./symbols/parameter.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');
const PathTracker = require('./symbols/pathTracker.js');

const metricObjects = require('./metrics/metrics.js');

const math = require('./math.js');

const IRVisitor = require('../ir/visitor.js');
const visitorImplementations = [
  require('./analysis/array.js'),
  require('./analysis/callAndReturn.js'),
  require('./analysis/carouselsAnnotation.js'),
  require('./analysis/expression.js'),
  require('./analysis/for.js'),
  require('./analysis/forEach.js'),
  require('./analysis/functionDefinition.js'),
  require('./analysis/if.js'),
  require('./analysis/oblivIf.js'),
  require('./analysis/value.js'),
  require('./analysis/variable.js'),
  require('./analysis/sequence.js')
];

const StringifyVisitor = require('./helpers/stringify.js');

function Analyzer(language, code, costs, extraTyping) {
  Parameter.restCounter();

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
  this.functionLoopAbstractionMap = {}; // for pretty printing output

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

// Manage scopes
Analyzer.prototype.addScope = function () {
  this.variableTypeMap.addScope();
  this.functionReturnAbstractionMap.addScope();
  this.variableMetricMap.addScope();
  this.functionMetricAbstractionMap.addScope();
  this.parametersPathTracker.addScope();
  this.conditionsPathTracker.addScope();
};
Analyzer.prototype.removeScope = function () {
  this.variableTypeMap.removeScope();
  this.functionReturnAbstractionMap.removeScope();
  this.variableMetricMap.removeScope();
  this.functionMetricAbstractionMap.removeScope();
  this.parametersPathTracker.removeScope();
  this.conditionsPathTracker.removeScope();
};
Analyzer.prototype.setTypeWithConditions = function (variableName, variableType, oldType) {
  const scopeIndex = this.variableTypeMap.lastIndexOf(variableName);
  if (scopeIndex === -1) {
    this.variableTypeMap.add(variableName, variableType);
    return;
  }

  if (oldType == null) {
    // might be a unit, or the actual type, guaranteed not to have a conflict at this point
    oldType = this.variableTypeMap.scopes[scopeIndex][variableName];
  }

  // all conditions up to this point
  const conditions = this.conditionsPathTracker.retrieveAll(scopeIndex+1);
  if (conditions.length === 0) {
    this.variableTypeMap.set(variableName, variableType);
    return;
  }

  this.variableTypeMap.set(variableName, variableType.combine(oldType, math.and.apply(math, conditions)));
};
Analyzer.prototype.setMetricWithConditions = function (variableName, variableMetric, oldMetric) {
  const scopeIndex = this.variableMetricMap.lastIndexOf(variableName);
  if (scopeIndex === -1) {
    this.variableMetricMap.add(variableName, variableMetric);
    return;
  }

  if (oldMetric == null) {
    oldMetric = this.variableMetricMap.scopes[scopeIndex][variableName];
  }

  // all conditions up to this point
  const conditions = this.conditionsPathTracker.retrieveAll(scopeIndex+1);
  if (conditions.length === 0) {
    this.variableMetricMap.set(variableName, variableMetric);
    return;
  }

  this.variableMetricMap.set(variableName, math.iff(math.and.apply(math, conditions), variableMetric, oldMetric));
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

  // initialize maps used during visitor to track state along visit paths
  this.parametersPathTracker = new PathTracker();
  this.conditionsPathTracker = new PathTracker();
  this.functionReturnConditionMap = {}; // {functionName -> [ {condition: ..., type: ..., metric: ...} ]

  // tracks the current function
  this.currentFunctionName = null;

  // start the visitor pattern
  this.visitor.start(this.IR, '');
};

// Simplify closed forms
Analyzer.prototype.simplifyClosedForms = function () {
  const cfm = this.abstractionToClosedFormMap;
  for (var fn in cfm) {
    cfm[fn] = math.simplify(cfm[fn]);
  }
};

// Retrieves the symbolic result: this can be plotted or displayed
Analyzer.prototype.symbolicOutput = function () {
  return new SymbolicOutput(this);
};

// returns a string with the IR code (pretty formatted) with the metric, typing, and error annotations embedded in it for debugging
Analyzer.prototype.prettyPrint = function (withAnnotation, HTML) {
  const debuggingVisitor = new StringifyVisitor(withAnnotation !== false ? this.intermediateResults : null, HTML);
  return debuggingVisitor.start(this.IR);
};

// Exports
module.exports = Analyzer;