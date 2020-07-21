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

        let ifElse = primitiveCosts['if_else'][this.metricTitle];
        if (typeof(ifElse) === 'function') {
          ifElse = ifElse.apply(this, arguments);
        }

        let clt = arithmeticCosts['clt'][this.metricTitle];
        if (typeof(clt) === 'function') {
          clt = clt.apply(this, arguments);
        }

        // length many simple (mux) obliv ifs and ==
        return combinators.mapOrSingle(function (ifElse, clt) {
          return '(' + arrayLength.toString() + ')*(' + ifElse + ' + ' + clt + ')';
        }, [ifElse, clt]);
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
    },
    // swap is sort of similar to array access at a secret index
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:array@D,secret:(true|false)>\\.swap\\(<type:[a-zA-Z_]+@D,secret:true>,<type:[a-zA-Z_]+@D,secret:true>\\)'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const arrayLength = childrenType.leftType.dependentType.length;

        let ifElse = primitiveCosts['if_else'][this.metricTitle];
        if (typeof(ifElse) === 'function') {
          ifElse = ifElse.apply(this, arguments);
        }

        let clt = arithmeticCosts['clt'][this.metricTitle];
        if (typeof(clt) === 'function') {
          clt = clt.apply(this, arguments);
        }

        // length many simple (mux) obliv ifs and ==
        return combinators.mapOrSingle(function (ifElse, clt) {
          return '(' + arrayLength.toString() + ')*(4*(' + ifElse + ') + 2*(' + clt + '))';
        }, [ifElse, clt]);
      })
    },
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '((<type:array@D,secret:(true|false)>\\.swap\\(<type:[a-zA-Z_]+@D,secret:false>,<type:[a-zA-Z_]+@D,secret:true>\\))'
          + '||(<type:array@D,secret:(true|false)>\\.swap\\(<type:[a-zA-Z_]+@D,secret:true>,<type:[a-zA-Z_]+@D,secret:false>\\)))'
      },
      value: combinators.mapCombinator(metrics,function (node, metric, pathStr, childrenType, childrenMetric) {
        const arrayLength = childrenType.leftType.dependentType.length;

        let ifElse = primitiveCosts['if_else'][this.metricTitle];
        if (typeof(ifElse) === 'function') {
          ifElse = ifElse.apply(this, arguments);
        }

        let clt = arithmeticCosts['clt'][this.metricTitle];
        if (typeof(clt) === 'function') {
          clt = clt.apply(this, arguments);
        }

        // length many simple (mux) obliv ifs and ==
        return combinators.mapOrSingle(function (ifElse, clt) {
          return '(' + arrayLength.toString() + ')*(2*(' + ifElse + ') + ' + clt + ')';
        }, [ifElse, clt]);
      })
    },
    {
      rule: {
          nodeType: 'FunctionCall',
          match: '.*db_((get)|(insert))\\(@P\\)'
      },
      value: combinators.mapCombinator(metrics, function (node, metric, pathStr, childrenType, childrenMetric) {
        // functions to use the OblivMultimap type until carousels can handle it without specialcasing
        //assume first argument is a matrix
        const n = childrenType.parameters[0].dependentType.rows;

        let ifElse = primitiveCosts['if_else'][this.metricTitle];
        if (typeof(ifElse) === 'function') {
          ifElse = ifElse.apply(this, arguments);
        }

        let clt = arithmeticCosts['clt'][this.metricTitle];
        if (typeof(clt) === 'function') {
          clt = clt.apply(this, arguments);
        }

        // length*length many simple (mux) obliv ifs and ==
        return combinators.mapOrSingle(function (ifElse, clt) {
          return '(' + n.toString() + '*' + n.toString() +')*(2*(' + ifElse + ') + ' + clt + ')';
        }, [ifElse, clt]);

      })
    },
  ];
};
