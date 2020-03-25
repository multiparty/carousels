const IRVisitor = require('../../ir/visitor.js');

function ModifiedVisitor() {
  this.variables = {};
  IRVisitor.call(this);
}

// inherit IRVisitor
ModifiedVisitor.prototype = Object.create(IRVisitor.prototype);

// make start return the nodes
ModifiedVisitor.prototype.start = function (node) {
  this.variables = {};
  IRVisitor.prototype.start.apply(this, arguments);

  return Object.keys(this.variables);
};

// Override visit functions
ModifiedVisitor.prototype.visitTypeNode = function (node) {};
ModifiedVisitor.prototype.visitFunctionDefinition = function (node) {};
ModifiedVisitor.prototype.visitLiteralExpression = function (node) {};
ModifiedVisitor.prototype.visitNameExpression = function (node) {};
ModifiedVisitor.prototype.visitArrayExpression = function (node) {};
ModifiedVisitor.prototype.visitReturnStatement = function (node) {
  this.visit(node.expression);
};
ModifiedVisitor.prototype.visitVariableDefinition = function (node) {
  this.visit(node.assignment);
};
ModifiedVisitor.prototype.visitForEach = function (node) {
  this.variables[node.iterator.name] = true;
  this.visit(node.range);
  this.visit(node.body);
};
ModifiedVisitor.prototype.visitFor = function (node) {
  this.visit(node.initial);
  this.visit(node.condition);
  this.visit(node.increment);
  this.visit(node.body);
};
ModifiedVisitor.prototype.visitVariableAssignment = function (node) {
  this.variables[node.name.name] = true;
  this.visit(node.expression);
};
ModifiedVisitor.prototype.visitIf = function (node) {
  this.visit(node.condition);
  this.visit(node.ifBody);
  this.visit(node.elseBody);
};
ModifiedVisitor.prototype.visitOblivIf = ModifiedVisitor.prototype.visitIf;
ModifiedVisitor.prototype.visitDirectExpression = function (node) {
  for (let i = 0; i < node.operands.length; i++) {
    this.visit(node.operands[i]);
  }
};
ModifiedVisitor.prototype.visitParenthesesExpression = function (node) {
  this.visit(node.expression);
};
ModifiedVisitor.prototype.visitArrayAccess = function (node) {
  this.visit(node.array);
  this.visit(node.index);
};
ModifiedVisitor.prototype.visitRangeExpression = function (node) {
  this.visit(node.start);
  this.visit(node.end);
  this.visit(node.increment);
};
ModifiedVisitor.prototype.visitSliceExpression = function (node) {
  this.visit(node.array);
  this.visit(node.range);
};
ModifiedVisitor.prototype.visitFunctionCall = function (node) {
  for (let i = 0; i < node.parameters.length; i++) {
    this.visit(node.parameters[i]);
  }
};
ModifiedVisitor.prototype.visitDotExpression = function (node) {
  this.visit(node.left);
  this.visit(node.right);
};
ModifiedVisitor.prototype.visitSequence = function (nodes) {
  for (let i = 0; i < nodes.length; i++) {
    this.visit(nodes[i]);
  }
};
module.exports = ModifiedVisitor;