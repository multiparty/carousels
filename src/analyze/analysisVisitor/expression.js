const ParenthesesExpression = function (node, args) {
  return this.visit(node.expression, args);
};

const DirectExpression = function (node, args) {};

const DotExpression = function (node, args) {};

const NameExpression = function (node, args) {};

module.exports = {
  ParenthesesExpression: ParenthesesExpression,
  DirectExpression: DirectExpression,
  DotExpression: DotExpression,
  NameExpression: NameExpression
};