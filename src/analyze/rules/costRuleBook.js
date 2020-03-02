const RuleBook = require('./ruleBook.js');
const math = require('../math.js');

function CostRuleBook(rules) {
  const operations = rules.operations.map(function (op) {
    const copy = Object.assign({}, op);

    copy.value = {};
    for (let metric in op.value) {
      if (!Object.prototype.hasOwnProperty.call(op.value, metric)) {
        continue;
      }
      copy.value[metric] = math.parse(op.value[metric]);
    }
    return copy;
  });

  RuleBook.call(this, operations);
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