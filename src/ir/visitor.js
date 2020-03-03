const IR_NODES = require('./ir.js');

// The visitor class
function IRVisitor(namedArgs) {
  Object.assign(this, namedArgs);
}

// Start visiting
IRVisitor.prototype.start = function (IRNode, args) {
  return this.visit(IRNode, args);
};

IRVisitor.prototype.visit = function (node, args) {
  try {
    if (node == null) {
      return args;
    }

    if (Array.isArray(node)) {
      return this['visitSequence'](node, args);
    }

    return this['visit' + node.nodeType](node, args);
  } catch (error) {
    if (!error.__visited) {
      error.message = 'Error occured in carousels while parsing "'
        + (node.nodeType != null ? node.nodeType : 'Sequence')
        + '" node with args "' + args + '"\n'
        + error.message;
      error.__visited = true;
    }
    throw error;
  }
};

IRVisitor.prototype.addVisitor = function (nodeType, visitorFunction) {
  if (IR_NODES.indexOf(nodeType) === -1 && nodeType !== 'Sequence') {
    throw new Error('Attempted to add visitor for illegal node type "' + nodeType + '"!');
  }

  this['visit'+nodeType] = visitorFunction.bind(this);
};

IRVisitor.prototype.addVisitors = function (visitorsMap) {
  for (let nodeType in visitorsMap) {
    if (Object.prototype.hasOwnProperty.call(visitorsMap, nodeType)) {
      this.addVisitor(nodeType, visitorsMap[nodeType]);
    }
  }
};

// Default visitor used for node types for which a user visitor was not set
const defaultVisitor = function (nodeType, node, args) {
  console.log('Warning: visitor function for', nodeType, 'is undefined!');
  return args;
};
for (let i = 0; i < IR_NODES.length; i++) {
  const nodeType = IR_NODES[i];
  IRVisitor.prototype['visit'+nodeType] = defaultVisitor.bind(null, nodeType);
}

// Visitor for sequences (e.g. body of a function or body of a for loop)
IRVisitor.prototype.visitSequence = function (nodeType, node, args) {
  console.log('Warning: visitor function for "Sequence" is undefined!');
  return args;
};

module.exports = IRVisitor;