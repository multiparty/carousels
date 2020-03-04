const RuleBook = require('./ruleBook.js');
const math = require('../math.js');

function CostRuleBook(analyzer, rules) {
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

  RuleBook.call(this, analyzer, operations, 'costs');
}

// inherit RuleBook
CostRuleBook.prototype = Object.create(RuleBook.prototype);

// Apply matching rule to metrics if found
CostRuleBook.prototype.applyMatch = function (node, expressionTypeString, metrics) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return Object.assign({}, metrics);
  }

  const newMetrics = this.analyzer.mapMetrics(function (metricTitle, metricObject) {
    return metricObject.addCost(metrics[metricTitle], matchedValue[metricTitle]);
  });
  return newMetrics;
};

module.exports = CostRuleBook;