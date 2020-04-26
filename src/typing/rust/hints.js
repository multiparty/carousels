module.exports = [
  // carouselsCombine is an identity over the first parameter
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'carouselsCombine\\(@P\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: children.parameters[0],
        parameters: []
      };
    }
  }
];