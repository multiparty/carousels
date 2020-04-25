// visitor that checks if variable is used in expression
module.exports = function (variable, expression) {
  let found = false;
  const boundAttr = '_carousels_bound' + variable;
  expression.traverse(function (node, path, parent) {
    switch (node.type) {
      case 'AccessorNode':
      case 'ArrayNode':
      case 'ConditionalNode':
      case 'ConstantNode':
      case 'FunctionNode':
      case 'IndexNode':
      case 'ObjectNode':
      case 'OperatorNode':
      case 'ParenthesisNode':
      case 'RangeNode':
      case 'RelationalNode':
        if (parent[boundAttr]) {
          node[boundAttr] = parent[boundAttr];
        }
        break;

      case 'FunctionAssignmentNode':
        if (node.params.indexOf(variable) > -1) {
          // not a free variable
          node[boundAttr] = true;
        }
        break;
      case 'SymbolNode':
        if (parent[boundAttr] !== true && node.name === variable) {
          found = true;
        }
        break;

      case 'AssignmentNode':
      case 'BlockNode':
      default:
        throw new Error('Unsupported node type "' + node.type + '" in mathjs expression!');
    }
  });

  return found;
};