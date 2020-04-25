const IRVisitor = require('../../ir/visitor.js');
const ScopedMap = require('../symbols/scopedMap.js');

const carouselsTypes = require('../symbols/types.js');

function ModifiedVisitor(analyzer) {
  this.analyzer = analyzer;
  this.undefinedModifiedVariables = {};
  this.definedVariables = new ScopedMap();
  IRVisitor.call(this);
}

// inherit IRVisitor
ModifiedVisitor.prototype = Object.create(IRVisitor.prototype);

// make start return the nodes
ModifiedVisitor.prototype.start = function (node) {
  this.undefinedModifiedVariables = {};
  this.definedVariables = new ScopedMap();

  IRVisitor.prototype.start.apply(this, arguments);

  return Object.keys(this.undefinedModifiedVariables);
};

// Override visit functions
ModifiedVisitor.prototype.visitTypeNode = function (node) {};
ModifiedVisitor.prototype.visitCarouselsAnnotation = function (node) {};
ModifiedVisitor.prototype.visitFunctionDefinition = function (node) {};
ModifiedVisitor.prototype.visitLiteralExpression = function (node) {};
ModifiedVisitor.prototype.visitNameExpression = function (node) {};
ModifiedVisitor.prototype.visitArrayExpression = function (node) {};
ModifiedVisitor.prototype.visitReturnStatement = function (node) {
  this.visit(node.expression);
};
ModifiedVisitor.prototype.visitVariableDefinition = function (node) {
  this.definedVariables.add(node.name.name, true);
  this.visit(node.assignment);
};
ModifiedVisitor.prototype.visitForEach = function (node) {
  // we only support iterators that are direct names
  if (node.iterator.nodeType !== 'NameExpression') {
    throw new Error('Unsupported iterator node of type "' + node.iterator.nodeType +'", expected "NameExpression"!');
  }

  // nested for each loops iterators do not survive the scope of the nested loop
  // they shadow but do not modify any variables with matching name from a higher scope
  // so they are considered defined variables within the scope
  this.visit(node.range);

  this.definedVariables.addScope();
  this.definedVariables.add(node.iterator.name, true);
  this.visit(node.body);
  this.definedVariables.removeScope();
};
ModifiedVisitor.prototype.visitFor = function (node) {
  throw new Error('Regular for loops are not yet supported! use foreach instead!');
};
ModifiedVisitor.prototype.visitVariableAssignment = function (node) {
  // do not track global undefined variables
  if (!this.definedVariables.has(node.name.name) && this.analyzer.variableTypeMap.has(node.name.name)) {
    this.undefinedModifiedVariables[node.name.name] = true;
  }
  this.visit(node.expression);
};
ModifiedVisitor.prototype.visitIf = function (node) {
  this.visit(node.condition);

  this.definedVariables.addScope();
  this.visit(node.ifBody);
  this.definedVariables.removeScope();

  this.definedVariables.addScope();
  this.visit(node.elseBody);
  this.definedVariables.removeScope();
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
  this.visit(node.function);
  for (let i = 0; i < node.parameters.length; i++) {
    this.visit(node.parameters[i]);
  }
};
ModifiedVisitor.prototype.visitDotExpression = function (node) {
  if (node.right.nodeType !== 'NameExpression' && node.right.nodeType !== 'LiteralExpression') {
    throw new Error('Unsupported expression "' + node.right.nodeType + '" to right of the "."!');
  }

  this.visit(node.left);

  // <arr>.push() has side effects
  if (node.left.nodeType === 'NameExpression' && node.right.name === 'push') {
    const varName = node.left.name;
    if (!this.definedVariables.has(varName)) { // ensure array variable is not defined within the block
      // can use this because we only allow variables defined outside this if (so they are present in the map) and because we disallow changing the types of variables
      const type = this.analyzer.variableTypeMap.get(varName, null); // do not bother with global undefined variables
      if (type != null && type.is(carouselsTypes.ENUM.ARRAY)) {
        this.undefinedModifiedVariables[varName] = true;
      }
    }
  }
};
ModifiedVisitor.prototype.visitSequence = function (nodes) {
  for (let i = 0; i < nodes.length; i++) {
    this.visit(nodes[i]);
  }
};
module.exports = ModifiedVisitor;