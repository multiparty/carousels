const RuleBook = require('./ruleBook.js');
const math = require('../math.js');

function CostRuleBook(analyzer, rules, metricTitle) {
  const operations = rules.operations.map(function (op) {
    return Object.assign({}, op, {value: math.parse(op.value[metricTitle])});
  });
  RuleBook.call(this, analyzer, operations, 'costs');
}

// inherit RuleBook
CostRuleBook.prototype = Object.create(RuleBook.prototype);

// Apply matching rule to metric if found
CostRuleBook.prototype.applyMatch = function (node, expressionTypeString, metric) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return metric;
  }

  return this.analyzer.metric.addCost(metric, matchedValue);
};

module.exports = CostRuleBook;