const RuleBook = require('./ruleBook.js');
const math = require('../math.js');

function CostRuleBook(analyzer, rules, metricTitle) {
  const operations = rules.operations.map(function (op) {
    return Object.assign({}, op, {value: op.value[metricTitle]});
  });
  RuleBook.call(this, analyzer, operations, 'costs');
}

// inherit RuleBook
CostRuleBook.prototype = Object.create(RuleBook.prototype);

// Apply matching rule to metric if found
CostRuleBook.prototype.applyMatch = function (node, expressionTypeString, args, metric, childrenType, childrenMetric) {
  let matchedValue = this.findMatch(node, expressionTypeString);
  if (typeof(matchedValue) === 'function') {
    matchedValue = matchedValue.call(this.analyzer, node, metric, args, childrenType, childrenMetric);
  }

  if (matchedValue === undefined) {
    return metric;
  }

  if (matchedValue.startsWith && matchedValue.startsWith('=')) {
    return math.parse(matchedValue.substring(1));
  }

  if (matchedValue.__absolute) {
    matchedValue = matchedValue.metric.map(function (v) {
      return math.parse(v);
    });
    return matchedValue;
  }

  return this.analyzer.metric.addCost(metric, matchedValue);
};

module.exports = CostRuleBook;