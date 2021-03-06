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
IRVisitor.prototype.start = function () {
  return this.visit.apply(this, arguments);
};

IRVisitor.prototype.visit = function (node) {
  try {
    if (node == null) {
      return null;
    }

    const nodeType = Array.isArray(node) ? 'Sequence' : node.nodeType;
    DEBUG_LOG(this._indent++, 'visit', nodeType);
    const result = this['visit' + nodeType].apply(this, arguments);
    DEBUG_LOG(--this._indent, 'end', nodeType);
    return result;
  } catch (error) {
    if (!error.__visited) {
      error.message = 'Error occurred in carousels:\n'
        + 'NodeType: ' + (node.nodeType != null ? node.nodeType : (Array.isArray(node) ? 'Sequence' : JSON.stringify(node))) + '\n'
        + 'arguments: ' + JSON.stringify(Array.from(arguments).slice(1)) + '\n'
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