// All node types that can be visited
const IR_NODES = [
  // logical nodes
  'TypeNode',
  // statements
  'FunctionDefinition',
  'ReturnStatement',
  'VariableDefinition',
  'ForEach',
  'For',
  'VariableAssignment',
  // expressions
  'If',
  'OblivIf',
  'LiteralExpression',
  'NameExpression',
  'DirectExpression',
  'ParenthesesExpression',
  'ArrayAccess',
  'RangeExpression',
  'SliceExpression',
  'ArrayExpression',
  'FunctionCall',
  'DotExpression'
];

// The visitor class
function IRVisitor(IR) {
  this.IR = IR;
}

// Start visiting
IRVisitor.prototype.start = function (args) {
  this.visit(this.IR, args);
};

IRVisitor.prototype.visit = function (node, args) {
  if (node == null || node.nodeType == null) {
    return args;
  }

  return this['visit'+node.nodeType](node, args);
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