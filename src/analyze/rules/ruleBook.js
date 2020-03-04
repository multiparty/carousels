const Rule = require('./rule.js');

const ALLOWED_NODES = {
  costs: ['FunctionCall', 'DotExpression', 'NameExpression', 'DirectExpression', 'If', 'OblivIf'],
  typing: ['FunctionCall', 'DotExpression', 'NameExpression', 'DirectExpression']
};

function RuleBook(analyzer, rules, _type) {
  this.analyzer = analyzer;
  this.rules = {};

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    if (ALLOWED_NODES[_type].indexOf(rule.rule.nodeType) === -1) {
      throw new Error('Illegal nodeType "' + rule.rule.nodeType + '" used in rule!')
    }

    const bookArray = this.rules[rule.nodeType] || [];
    bookArray.push(new Rule(rule.rule.match, rule.value));
    this.rules[rule.rule.nodeType] = bookArray;
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