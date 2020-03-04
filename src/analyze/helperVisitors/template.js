const IRVisitor = require('../../ir/visitor.js');

function TemplateVisitor(namedArgs) {
}

// inherit IRVisitor
TemplateVisitor.prototype = Object.create(IRVisitor.prototype);

// Override visit functions
TemplateVisitor.prototype.visitTypeNode = function (node, args) {
  const type = node.type;
  const secret = node.secret;
  const dependentTypeResult = this.visit(node.dependentType, args);
};
TemplateVisitor.prototype.visitFunctionDefinition = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.visit(node.parameters[i], args));
  }
  const returnTypeResult = this.visit(node.returnType, args);
  const bodyResult = this.visit(node.body, args);
};
TemplateVisitor.prototype.visitReturnStatement = function (node, args) {
  const expressionResult = this.visit(node.expression, args);
};
TemplateVisitor.prototype.visitVariableDefinition = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const typeResult = this.visit(node.type, args);
  const assignmentResult = this.visit(node.assignment, args);
};
TemplateVisitor.prototype.visitForEach = function (node, args) {
  const iteratorDefinitionResult = this.visit(node.iteratorDefinition, args);
  const rangeResult = this.visit(node.range, args);
  const bodyResult = this.visit(node.body, args);
};
TemplateVisitor.prototype.visitFor = function (node, args) {
  const initialResult = this.visit(node.initial, args);
  const conditionResult = this.visit(node.condition, args);
  const incrementResult = this.visit(node.increment, args);
  const bodyResult = this.visit(node.body, args);
};
TemplateVisitor.prototype.visitVariableAssignment = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const expressionResult = this.visit(node.expression, args);
};
TemplateVisitor.prototype.visitIf = function (node, args) {
  const conditionResult = this.visit(node.condition, args);
  const ifBodyResult = this.visit(node.ifBody, args);
  const elseBodyResult = this.visit(node.elseBody, args);
};
TemplateVisitor.prototype.visitOblivIf = function (node, args) {
  const conditionResult = this.visit(node.condition, args);
  const ifBodyResult = this.visit(node.ifBody, args);
  const elseBodyResult = this.visit(node.elseBody, args);
};
TemplateVisitor.prototype.visitLiteralExpression = function (node, args) {
  const type = node.type; // "string", "number", "boolean"
  const value = node.value; // string
};
TemplateVisitor.prototype.visitNameExpression = function (node, args) {
  const name = node.name;
};
TemplateVisitor.prototype.visitDirectExpression = function (node, args) {
  const operator = node.operator;
  const operandsResults = [];
  for (let i = 0; i < node.operands.length; i++) {
    operandsResults.push(this.visit(node.operands[i], args));
  }
};
TemplateVisitor.prototype.visitParenthesesExpression = function (node, args) {
  const expressionResult = this.visit(node.expression, args);
};
TemplateVisitor.prototype.visitArrayAccess = function (node, args) {
  const arrayResult = this.visit(node.array, args);
  const indexResult = this.visit(node.index, args);
};
TemplateVisitor.prototype.visitRangeExpression = function (node, args) {
  const startResult = this.visit(node.start, args);
  const endResult = this.visit(node.end, args);
  const incrementResult = this.visit(node.increment, args);
};
TemplateVisitor.prototype.visitSliceExpression = function (node, args) {
  const arrayResult = this.visit(node.array, args);
  const rangeResult = this.visit(node.range, args);
};
TemplateVisitor.prototype.visitArrayExpression = function (node, args) {
  const elementsResults = [];
  for (let i = 0; i < node.elements.length; i++) {
    elementsResults.push(this.visit(node.elements[i], args));
  }
};
TemplateVisitor.prototype.visitFunctionCall = function (node, args) {
  const functionResult = this.visit(node.function, args);
  const parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.visit(node.parameters[i], args));
  }
};
TemplateVisitor.prototype.visitDotExpression = function (node, args) {
  const leftResult = this.visit(node.left, args);
  const rightResult = this.visit(node.right, args);
};
TemplateVisitor.prototype.visitSequence = function (nodes, args) {
  const statementsResults = [];
  for (let i = 0; i < nodes.length; i++) {
    statementsResults.push(this.visit(nodes[i], args));
  }
};

module.exports = TemplateVisitor;