const RuleBook = require('./ruleBook.js');

function CostRuleBook(rules) {
  RuleBook.call(this, rules.operations);
}

CostRuleBook.prototype.applyMatch = function (node, expressionTypeString, args, metrics) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return Object.assign({}, metrics);
  }

  const newMetrics = {};
  for (let metricTitle in metrics) {
    if (!Object.hasOwnProperty.call(metrics, metricTitle)) {
      continue;
    }

    newMetrics[metricTitle] = metrics[metricTitle].addCost(matchedValue);
  }

  return newMetrics;
};

// inherit RuleBook
CostRuleBook.prototype = Object.create(RuleBook.prototype);

module.exports = CostRuleBook;