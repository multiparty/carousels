module.exports = [
  // to_owned, clone, into, copy are similar to identity
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '(@T\\.to_owned\\(\\))|(@T.clone\\(\\))|(@T\\.into\\(\\))|(@T\\.copy\\(\\))'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.leftType,
        parameters: []
      };
    }
  },
  // P::run() turns a public value to a syntactic secret
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'P::run\\(@T\\)'
    },
    value: function (node, pathStr, children) {
      const returnType = children.parameters[0].copy();
      returnType.secret = true;
      return {
        type: returnType,
        parameters: []
      };
    }
  }
];