const regex = require('../utils/regex.js');

module.exports = function (metrics, floatCost) {
  return [
    // cadd/csub/sadd/ssub
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.EITHER_SECRET_REGEX('\\+|-', 'float')
      },
      value: floatCost['addf']
    },
    // smult/cmult
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.EITHER_SECRET_REGEX('\\*', 'float')
      },
      value: floatCost['multf']
    },
    // sdiv/cdiv/smod/cmod
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.EITHER_SECRET_REGEX('/|%', 'float')
      },
      value: floatCost['divf']
    },
    // all comparisons
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.EITHER_SECRET_REGEX('<|>|(<=)|(>=)|(==)|(!=)', 'float')
      },
      value: floatCost['ltf']
    },
    // sqrt
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:float,secret:true>\\.sqrt\\(\\)'
      },
      value: floatCost['sqrtf']
    }
  ];
};