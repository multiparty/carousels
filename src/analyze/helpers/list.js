const IRVisitor = require('../../ir/visitor.js');

function ListNodesVisitor() {
  this.nodes = {};
  IRVisitor.call(this);
}

// inherit IRVisitor
ListNodesVisitor.prototype = Object.create(IRVisitor.prototype);

// append nodeType to node
ListNodesVisitor.prototype.visit = function (node) {
  if (node == null) {
    return IRVisitor.prototype.visit.apply(this, arguments);
  }

  if (Array.isArray(node)) {
    this.nodes['Sequence'] = true;
    return IRVisitor.prototype.visit.apply(this, arguments);
  }

  this.nodes[node.nodeType] = true;
  return IRVisitor.prototype.visit.apply(this, arguments);
};

// make start return the nodes
ListNodesVisitor.prototype.start = function (node) {
  this.nodes = {};

  IRVisitor.prototype.start.apply(this, arguments);

  const result = [];
  for (let nodeType in this.nodes) {
    if (Object.prototype.hasOwnProperty.call(this.nodes, nodeType)) {
      result.push(nodeType);
    }
  }

  return result.sort();
};

ListNodesVisitor.prototype.containsOnly = function (node, nodeTypes) {
  const contained = this.start(node);

  nodeTypes = nodeTypes.sort();
  if (contained.length > nodeTypes.length) {
    return false;
  }

  let j = 0; // index in nodeTypes
  for (let i = 0; i < contained.length; i++) {
    while (nodeTypes[j] !== contained[i]) {
      j++;

      if (j >= nodeTypes.length) {
        return false;
      }
    }

    j++;
  }

  return true;
};

ListNodesVisitor.prototype.has = function (node, nodeType) {
  const contained = this.start(node);
  return contained.indexOf(nodeType) > - 1;
};

// Override visit functions
ListNodesVisitor.prototype.visitTypeNode = function (node, args) {
  const type = node.type;
  const secret = node.secret;
  const dependentTypeResult = this.visit(node.dependentType, args);
};
ListNodesVisitor.prototype.visitFunctionDefinition = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.visit(node.parameters[i], args));
  }
  const returnTypeResult = this.visit(node.returnType, args);
  const bodyResult = this.visit(node.body, args);
};
ListNodesVisitor.prototype.visitReturnStatement = function (node, args) {
  const expressionResult = this.visit(node.expression, args);
};
ListNodesVisitor.prototype.visitVariableDefinition = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const typeResult = this.visit(node.type, args);
  const assignmentResult = this.visit(node.assignment, args);
};
ListNodesVisitor.prototype.visitForEach = function (node, args) {
  const iteratorResult = this.visit(node.iterator, args);
  const rangeResult = this.visit(node.range, args);
  const bodyResult = this.visit(node.body, args);
};
ListNodesVisitor.prototype.visitFor = function (node, args) {
  const initialResult = this.visit(node.initial, args);
  const conditionResult = this.visit(node.condition, args);
  const incrementResult = this.visit(node.increment, args);
  const bodyResult = this.visit(node.body, args);
};
ListNodesVisitor.prototype.visitVariableAssignment = function (node, args) {
  const nameResult = this.visit(node.name, args);
  const expressionResult = this.visit(node.expression, args);
};
ListNodesVisitor.prototype.visitIf = function (node, args) {
  const conditionResult = this.visit(node.condition, args);
  const ifBodyResult = this.visit(node.ifBody, args);
  const elseBodyResult = this.visit(node.elseBody, args);
};
ListNodesVisitor.prototype.visitOblivIf = function (node, args) {
  const conditionResult = this.visit(node.condition, args);
  const ifBodyResult = this.visit(node.ifBody, args);
  const elseBodyResult = this.visit(node.elseBody, args);
};
ListNodesVisitor.prototype.visitLiteralExpression = function (node, args) {
  const type = node.type; // "str", "number", "bool"
  const value = node.value; // string
};
ListNodesVisitor.prototype.visitNameExpression = function (node, args) {
  const name = node.name;
};
ListNodesVisitor.prototype.visitDirectExpression = function (node, args) {
  const operator = node.operator;
  const operandsResults = [];
  for (let i = 0; i < node.operands.length; i++) {
    operandsResults.push(this.visit(node.operands[i], args));
  }
};
ListNodesVisitor.prototype.visitParenthesesExpression = function (node, args) {
  const expressionResult = this.visit(node.expression, args);
};
ListNodesVisitor.prototype.visitArrayAccess = function (node, args) {
  const arrayResult = this.visit(node.array, args);
  const indexResult = this.visit(node.index, args);
};
ListNodesVisitor.prototype.visitRangeExpression = function (node, args) {
  const startResult = this.visit(node.start, args);
  const endResult = this.visit(node.end, args);
  const incrementResult = this.visit(node.increment, args);
};
ListNodesVisitor.prototype.visitSliceExpression = function (node, args) {
  const arrayResult = this.visit(node.array, args);
  const rangeResult = this.visit(node.range, args);
};
ListNodesVisitor.prototype.visitArrayExpression = function (node, args) {
  const elementsResults = [];
  for (let i = 0; i < node.elements.length; i++) {
    elementsResults.push(this.visit(node.elements[i], args));
  }
};
ListNodesVisitor.prototype.visitFunctionCall = function (node, args) {
  const functionResult = this.visit(node.function, args);
  const parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.visit(node.parameters[i], args));
  }
};
ListNodesVisitor.prototype.visitDotExpression = function (node, args) {
  const leftResult = this.visit(node.left, args);
  const rightResult = this.visit(node.right, args);
};
ListNodesVisitor.prototype.visitSequence = function (nodes, args) {
  const statementsResults = [];
  for (let i = 0; i < nodes.length; i++) {
    statementsResults.push(this.visit(nodes[i], args));
  }
};

module.exports = ListNodesVisitor;