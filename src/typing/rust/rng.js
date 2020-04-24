const carouselsTypes = require('../../analyze/symbols/types.js');
const Parameter = require('../../analyze/symbols/parameter.js');

module.exports = [
  // array creation (for now all such arrays are defined to contain numbers)
  {
    rule: {
      nodeType: 'FunctionCall',
      match: 'rand::thread_rng\\(\\)'
    },
    value: function (node, pathStr, children) {
      return {
        type: new carouselsTypes.AbsType('RNG'),
        parameters: []
      };
    }
  },
  // <RNG>.gen_range returns length
  {
    rule: {
      nodeType: 'FunctionCall',
      match: '<type:RNG,secret:false>\\.gen_range\\(@P\\)'
    },
    value: function (node, pathStr, children) {
      const parameter = Parameter.forValue(pathStr + '[<RNGResult>]');
      const returnType = new carouselsTypes.NumberType(true, parameter.mathSymbol);

      return {
        type: returnType,
        parameters: [parameter]
      };
    }
  }
];