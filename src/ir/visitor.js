const IR_NODES = require('./ir.js');

// The visitor class
function IRVisitor(args) {
  this.args = args;
}

// Start visiting
IRVisitor.prototype.start = function (IRNode, args) {
  this.visit(IRNode, args);
};

IRVisitor.prototype.visit = function (node, args) {
  if (node == null || node.nodeType == null) {
    return args;
  }
  return this['visit'+node.nodeType](node, args);
};

IRVisitor.prototype.addVisitor = function (nodeType, visitorFunction) {
  if (IR_NODES.indexOf(nodeType) === -1) {
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

module.exports = IRVisitor;