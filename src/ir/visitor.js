const IR_NODES = require('./ir.js');

const DEBUG = false;

let DEBUG_LOG = function (indent) {
  let tab = '.';
  for (let i = 0; i < indent; i++) {
    tab += '..';
  }
  console.log.apply(console, [tab].concat(Array.from(arguments).slice(1)));
};
DEBUG_LOG = DEBUG ? DEBUG_LOG : function () {};

// The visitor class
function IRVisitor(namedArgs) {
  Object.assign(this, namedArgs);
  this._indent = 0;
}

// Start visiting
IRVisitor.prototype.start = function (IRNode, args) {
  return this.visit(IRNode, args);
};

IRVisitor.prototype.visit = function (node, args) {
  try {
    if (node == null) {
      return null;
    }

    if (Array.isArray(node)) {
      DEBUG_LOG(this._indent++, 'visit', 'Sequence');
      const result = this['visitSequence'](node, args);
      DEBUG_LOG(--this._indent, 'end', 'Sequence');
      return result;
    }

    DEBUG_LOG(this._indent++, 'visit', node.nodeType);
    const result = this['visit' + node.nodeType](node, args);
    DEBUG_LOG(--this._indent, 'end', node.nodeType);
    return result;
  } catch (error) {
    if (!error.__visited) {
      error.message = 'Error occured in carousels while parsing "'
        + (node.nodeType != null ? node.nodeType : (Array.isArray(node) ? 'Sequence' : JSON.stringify(node)))
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