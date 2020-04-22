const combinators = require('../utils/combinator.js');

module.exports = function (metrics, primitiveCosts, arithmeticCosts) {
  return [
    // general rust syntax and std library things
    // .len() has no cost
    {
      rule: {
        nodeType: 'DotExpression',
        match: '<type:array@D,secret:(true|false)>\\.len'
      },
      value: primitiveCosts['ZERO']
    },
    // array access at secret index
    {
      rule: {
        nodeType: 'ArrayAccess',
        match: '<type:array@D,secret:(true|false)>\\[<type:[a-zA-Z_]+@D,secret:true>\\]'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const arrayLength = childrenType.array.dependentType.length;
        return arrayLength.toString() + '*(' + primitiveCosts['if_else'][this.metricTitle] + ' + '
          + arithmeticCosts['clt'][this.metricTitle] + ')'; // length many simple (mux) obliv ifs and ==
      })
    },
    // .push modifies the cost of the array as a side effect
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:array@D,secret:(true|false)>\\.push\\(@T\\)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        if (node.function.left.nodeType === 'NameExpression') {
          const arrayName = node.function.left.name;
          this.setMetricWithConditions(arrayName, this.metric.store(metric));
        }
        return undefined;
      })
    }
  ];
};