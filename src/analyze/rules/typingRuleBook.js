const RuleBook = require('./ruleBook.js');
const carouselTypes = require('../symbols/types.js');

const DEFAULT_TYPE = new carouselTypes.AnyType(false);

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

  const result = matchedValue.call(this.analyzer, node, args, childrenTypes);
  this.analyzer.addParameters(result.parameters);
  return result.type;
};

module.exports = TypingRuleBook;