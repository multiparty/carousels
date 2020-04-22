const regex = require('../utils/regex.js');

module.exports = function (metrics, primitiveCosts, arithmeticCosts) {
  return [
    // cadd/csub
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('\\+|-')
      },
      value: arithmeticCosts['cadd']
    },
    // sadd/ssub
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('\\+|-')
      },
      value: arithmeticCosts['sadd']
    },
    // cmult
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('\\*')
      },
      value: arithmeticCosts['cmult']
    },
    // smult
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('\\*')
      },
      value: arithmeticCosts['smult']
    },
    // cmod, cdiv
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('/|%')
      },
      value: arithmeticCosts['sdiv']
    },
    // sdiv, smod
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('/|%')
      },
      value: arithmeticCosts['sdiv']
    }
  ];
};