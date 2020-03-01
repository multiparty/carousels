const RuleBook = require('./ruleBook.js');
const carouselTypes = require('../symbols/types.js');

const DEFAULT_TYPE = new carouselTypes.Type(carouselTypes.TYPE_ENUM.ANY, false);

function TypingRuleBook(rules) {
  RuleBook.call(this, rules);
}

TypingRuleBook.prototype.applyMatch = function (node, expressionTypeString, args, childrenTypes) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return DEFAULT_TYPE;
  }

  return matchedValue(node, args, childrenTypes);
};

// inherit RuleBook
TypingRuleBook.prototype = Object.create(RuleBook.prototype);

module.exports = TypingRuleBook;