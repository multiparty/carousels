const combinators = require('../utils/combinator.js');

const ops = {
  '+': 'addf',
  '-': 'addf',
  '*': 'multf',
  '/': 'divf'
};

module.exports = function (metrics, matrixCost) {
  return [
    // vector inner product
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:true>\\*<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:(true|false)>)|' +
          '(<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:(true|false)>\\*<type:matrix<elementsType:@T,rows:(.*),cols:1>,secret:true>)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.operands[0].dependentType.rows;
        const result = matrixCost['prod'](n)[this.metricTitle];

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    },
    // matrix matrix multiplication
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(<type:matrix@D,secret:true>\\*<type:matrix@D,secret:(true|false)>)|(<type:matrix@D,secret:(true|false)>\\*<type:matrix@D,secret:true>)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.operands[0].dependentType.rows;
        const m = childrenType.operands[0].dependentType.cols;
        const k = childrenType.operands[1].dependentType.cols;
        const result = matrixCost['mult'](n, m, k)[this.metricTitle];

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    },
    // scalar matrix
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(<type:matrix@D,secret:true>(\\*|\\+|\\-|/)@NFB)|(<type:matrix@D,secret:false>(\\*|\\+|\\-|/)<type:(number|boolean|float)@D,secret:true>)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.operands[0].dependentType.rows;
        const m = childrenType.operands[0].dependentType.cols;
        const op = ops[node.operator];
        const result = matrixCost['elementWise'](op, n, m)[this.metricTitle];

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    },
    // matrix scalar
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(@NFB(\\*|\\+|\\-|/)<type:matrix@D,secret:true>)|(<type:(number|boolean|float)@D,secret:true>(\\*|\\+|\\-|/)<type:matrix@D,secret:false>)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.operands[1].dependentType.rows;
        const m = childrenType.operands[1].dependentType.cols;
        const op = ops[node.operator];
        const result = matrixCost['elementWise'](op, n, m)[this.metricTitle]

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    },
    // matrix matrix element wise
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(<type:matrix@D,secret:true>(\\+|-)<type:matrix@D,secret:(true|false)>)|(<type:matrix@D,secret:(true|false)>\\*<type:matrix@D,secret:true>)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.operands[0].dependentType.rows;
        const m = childrenType.operands[0].dependentType.cols;
        const op = ops[node.operator];
        const result = matrixCost['elementWise'](op, n, m)[this.metricTitle];

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    },
    // matrix matrix mult element wise
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '(Vector::elementMult\\(<type:matrix@D,secret:true>,<type:matrix@D,secret:(true|false)>\\))|' +
          '(Vector::elementMult\\(<type:matrix@D,secret:(true|false)>,<type:matrix@D,secret:true>\\))'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.parameters[0].dependentType.rows;
        const m = childrenType.parameters[0].dependentType.cols;
        const result = matrixCost['elementWise']('multf', n, m)[this.metricTitle];

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    },
    // matrix inverse
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:matrix@D,secret:true>\\.inverse\\(\\)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const n = childrenType.leftType.dependentType.rows;
        const result = matrixCost['inv'](n)[this.metricTitle];

        if (typeof(result) === 'function') {
          return result.apply(this, arguments);
        }
        return result;
      })
    }
  ];
};