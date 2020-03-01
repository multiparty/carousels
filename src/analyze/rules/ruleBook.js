const Rule = require('./rule.js');

function RuleBook(rules) {
  this.rules = {};

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    const bookArray = this.rules[rule.nodeType] || [];
    this.rules[rule.rule.nodeType] = bookArray;

    bookArray.push(new Rule(rule.rule.match, rule.value));
  }
}

RuleBook.prototype.findMatch = function (node, expressionTypeString) {
  const rules = this.rules[node.nodeType] || [];
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].appliesTo(expressionTypeString)) {
      return rules[i].value;
    }
  }

  return undefined;
};

module.exports = RuleBook;