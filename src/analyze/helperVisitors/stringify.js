const IRVisitor = require('../../ir/visitor.js');

const INDENT = '  ';

const indentBlock = function (blockStr) {
  if (blockStr.trim().length === 0) {
    return '';
  }

  return INDENT + blockStr.replace(/\n/g, '\n' + INDENT);
};

function StringifyVisitor() {
}

// inherit IRVisitor
StringifyVisitor.prototype = Object.create(IRVisitor.prototype);

// default return is ''
StringifyVisitor.prototype.visit = function () {
  const result = IRVisitor.prototype.visit.apply(this, arguments);
  return result != null ? result : '';
};

// Override visit functions
StringifyVisitor.prototype.visitTypeNode = function (node, args) {
  const type = node.type;
  const secret = node.secret;
  const dependentTypeResult = this.visit(node.dependentType, args);
  return 'Possession<' + type + '<' + dependentTypeResult + '>>';
};
StringifyVisitor.prototype.visitFunctionDefinition = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.visit(node.parameters[i], args));
  }
  const returnTypeResult = this.visit(node.returnType, args);
  const bodyResult = this.visit(node.body, args);
  const sep = bodyResult.trim().length > 0 ? '\n' : '';

  return 'function ' + nameResult + '(' + parametersResults.join(', ') + ')' + ': ' + returnTypeResult + '{' + sep +
    indentBlock(bodyResult) + sep +
    '}';
};
StringifyVisitor.prototype.visitReturnStatement = function (node, args) {
  const expressionResult = this.visit(node.expression, args);
  return 'return ' + expressionResult;
};
StringifyVisitor.prototype.visitVariableDefinition = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const typeResult = this.visit(node.type, args);
  const assignmentResult = this.visit(node.assignment, args);

  let str = 'let ' + nameResult;
  str += typeResult.length > 0 ? (': ' + typeResult) : '';
  str += assignmentResult.length > 0 ? (' ' + assignmentResult.substring(assignmentResult.indexOf('='))) : '';
  return str;
};
StringifyVisitor.prototype.visitForEach = function (node, args) {
  const iteratorDefinitionResult = this.visit(node.iteratorDefinition, args);
  const rangeResult = this.visit(node.range, args);
  const bodyResult = this.visit(node.body, args);

  const sep = bodyResult.trim().length > 0 ? '\n' : '';
  return 'foreach (' + iteratorDefinitionResult + ' in ' + rangeResult + ') {' + sep +
    indentBlock(bodyResult) + sep +
    '}';
};
StringifyVisitor.prototype.visitFor = function (node, args) {
  let initialResult = this.visit(node.initial, args);
  let conditionResult = this.visit(node.condition, args);
  let incrementResult = this.visit(node.increment, args);
  let bodyResult = this.visit(node.body, args);

  const sep = bodyResult.trim().length > 0 ? '\n' : '';
  return 'for (\n' +
    indentBlock(initialResult) +
    '\n;\n' +
    indentBlock(conditionResult) +
    '\n;\n' +
    indentBlock(incrementResult) +
    '\n) {' + sep +
    indentBlock(bodyResult) + sep +
    '}';
};
StringifyVisitor.prototype.visitVariableAssignment = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const expressionResult = this.visit(node.expression, args);
  return nameResult + ' = ' + expressionResult;
};
StringifyVisitor.prototype.visitIf = function (node, args) {
  const conditionResult = this.visit(node.condition, args);
  const ifBodyResult = this.visit(node.ifBody, args);
  const elseBodyResult = this.visit(node.elseBody, args);

  const sep1 = ifBodyResult.trim().length > 0 ? '\n' : '';
  const sep2 = elseBodyResult.trim().length > 0 ? '\n' : '';
  return 'if (\n' +
    indentBlock(conditionResult) + '\n' +
    ') {' + sep1 +
    indentBlock(ifBodyResult) + sep1 +
    '} else {' + sep2 +
    indentBlock(elseBodyResult) + sep2 +
    '}';
};
StringifyVisitor.prototype.visitOblivIf = function (node, args) {
  const conditionResult = this.visit(node.condition, args);
  const ifBodyResult = this.visit(node.ifBody, args);
  const elseBodyResult = this.visit(node.elseBody, args);

  const sep1 = ifBodyResult.trim().length > 0 ? '\n' : '';
  const sep2 = elseBodyResult.trim().length > 0 ? '\n' : '';
  return 'obliv if (\n' +
    indentBlock(conditionResult) + '\n' +
    ') {' + sep1 +
    indentBlock(ifBodyResult) + sep1 +
    '} else {' + sep2 +
    indentBlock(elseBodyResult) + sep2 +
    '}';
};
StringifyVisitor.prototype.visitLiteralExpression = function (node, args) {
  const type = node.type; // "string", "number", "boolean"
  const value = node.value; // string

  if (type === 'string') {
    return '"' + value + '"';
  }

  return value;
};
StringifyVisitor.prototype.visitNameExpression = function (node, args) {
  const name = node.name;
  return name;
};
StringifyVisitor.prototype.visitDirectExpression = function (node, args) {
  const operator = node.operator;
  const operandsResults = [];
  for (let i = 0; i < node.operands.length; i++) {
    operandsResults.push(this.visit(node.operands[i], args));
  }
  return '(' + operandsResults.join(' ' + operator + ' ') + ')';
};
StringifyVisitor.prototype.visitParenthesesExpression = function (node, args) {
  const expressionResult = this.visit(node.expression, args);
  return '(' + expressionResult + ')';
};
StringifyVisitor.prototype.visitArrayAccess = function (node, args) {
  const arrayResult = this.visit(node.array, args);
  const indexResult = this.visit(node.index, args);
  return arrayResult + '[' + indexResult + ']';
};
StringifyVisitor.prototype.visitRangeExpression = function (node, args) {
  const startResult = this.visit(node.start, args);
  const endResult = this.visit(node.end, args);
  const incrementResult = this.visit(node.increment, args);
  return '[' + startResult + ' : ' + endResult +
    (incrementResult.trim().length > 0 ? ' : ' + incrementResult : '') + ']';
};
StringifyVisitor.prototype.visitSliceExpression = function (node, args) {
  const arrayResult = this.visit(node.array, args);
  const rangeResult = this.visit(node.range, args);
  return arrayResult + rangeResult;
};
StringifyVisitor.prototype.visitArrayExpression = function (node, args) {
  const elementsResults = [];
  for (let i = 0; i < node.elements.length; i++) {
    elementsResults.push(this.visit(node.elements[i], args));
  }
  return '[' + elementsResults.join(', ') + ']';
};
StringifyVisitor.prototype.visitFunctionCall = function (node, args) {
  const functionResult = this.visit(node.function, args);
  const parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.visit(node.parameters[i], args));
  }
  return functionResult + '(' + parametersResults.join(', ') + ')';
};
StringifyVisitor.prototype.visitDotExpression = function (node, args) {
  const leftResult = this.visit(node.left, args);
  const rightResult = this.visit(node.right, args);
  return leftResult + '.' + rightResult;
};
StringifyVisitor.prototype.visitSequence = function (nodes, args) {
  const statementsResults = [];
  for (let i = 0; i < nodes.length; i++) {
    statementsResults.push(this.visit(nodes[i], args));
  }
  return statementsResults.join('\n');
};

module.exports = StringifyVisitor;