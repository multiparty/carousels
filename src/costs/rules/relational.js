const combinators = require('../utils/combinator.js');
const regex = require('../utils/regex.js');

module.exports = function (metrics, primitiveCosts, arithmeticCosts) {
  return [
    // ceq, cneq
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('(==)|(!=)')
      },
      value: arithmeticCosts['ceq'] ? arithmeticCosts['ceq'] : arithmeticCosts['clt']
    },
    // clt, clteq, cgt, cgteq
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.ONE_SECRET_REGEX('<|>|(<=)|(>=)')
      },
      value: arithmeticCosts['clt']
    },
    // seq, sneq
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('(==)|(!=)')
      },
      value: arithmeticCosts['seq'] ? arithmeticCosts['seq'] : arithmeticCosts['clt']
    },
    // slt, slteq, sgt, sgteq
    {
      rule: {
        nodeType: 'DirectExpression',
        match: regex.BOTH_SECRET_REGEX('<|>|(<=)|(>=)')
      },
      value: arithmeticCosts['slt']
    },
    // oblivIf on arrays
    {
      rule: {
        nodeType: 'OblivIf',
        match: '@T\\?<type:array@D,secret:(true|false)>:<type:array@D,secret:(true|false)>'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        if (this.metricType === 'RoundMetric') {
          return primitiveCosts['if_else'][this.metricTitle];
        }

        const arrayLength = childrenType.ifBody.dependentType.length;
        return '(' + arrayLength.toString() + ')*(' + primitiveCosts['if_else'][this.metricTitle] + ')';
      })
    },
    // oblivIf on b-bits numbers
    {
      rule: {
        nodeType: 'OblivIf',
        match: '@T\\?@T:@T'
      },
      value: primitiveCosts['if_else']
    }
  ];
};