const regex = require('../utils/regex.js');

module.exports = function (metrics, primitiveCosts, arithmeticCosts) {
  return [
    // cor
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('\\|\\|')
      },
      value: primitiveCosts['cor'] ? primitiveCosts['cor'] : arithmeticCosts['cmult']
    },
    // cand
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('&&')
      },
      value: primitiveCosts['cand'] ? primitiveCosts['cand'] : arithmeticCosts['cmult']
    },
    // cxor
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('\\^\\^')
      },
      value: primitiveCosts['cxor'] ? primitiveCosts['cxor'] : arithmeticCosts['cmult']
    },
    // not
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(!<type:(number|bool)@D,secret:true>)'
      },
      value: primitiveCosts['not'] ? primitiveCosts['not'] : arithmeticCosts['cmult']
    },
    // sor
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('\\|\\|')
      },
      value: primitiveCosts['sor'] ? primitiveCosts['sor'] : arithmeticCosts['smult']
    },
    // sand
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('&&')
      },
      value: primitiveCosts['sand'] ? primitiveCosts['sand'] : arithmeticCosts['smult']
    },
    // sxor
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('\\^\\^')
      },
      value: primitiveCosts['sxor'] ? primitiveCosts['sxor'] : arithmeticCosts['smult']
    }
  ];
};