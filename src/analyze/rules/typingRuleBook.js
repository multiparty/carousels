const RuleBook = require('./ruleBook.js');
const carouselTypes = require('../symbols/types.js');

const DEFAULT_TYPE = new carouselTypes.Type(carouselTypes.TYPE_ENUM.ANY, false);

function TypingRuleBook(analyzer, rules) {
  RuleBook.call(this, analyzer, rules, 'typing');
}

// inherit RuleBook
TypingRuleBook.prototype = Object.create(RuleBook.prototype);

// apply match if found to get the new type of the expression
TypingRuleBook.prototype.applyMatch = function (node, expressionTypeString, args, childrenTypes) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return DEFAULT_TYPE;
  }

  return matchedValue.call(this.analyzer, node, args, childrenTypes);
};

module.exports = TypingRuleBook;