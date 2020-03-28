module.exports = {
  parameters: [
    {symbol: 'p', description: 'number of parties'},
    {symbol: 'b', description: 'number of bits in field'}
  ],
  metrics: [
    {
      title: 'Online Messages',
      description: 'Total number of messages sent during the online phase',
      type: 'TotalMetric'
    },
    {
      title: 'Online Rounds',
      description: 'Total number of rounds of communication during the online phase',
      type: 'RoundMetric'
    }
  ],
  operations: [
    // +
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '<type:(number|bool)@D,secret:true>\\+<type:(number|bool)@D,secret:true>'
      },
      value: {
        'Online Messages': '0',
        'Online Rounds': '0'
      }
    },
    // secure multiplication
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '<type:(number|bool)@D,secret:true>(\\*|(\\|\\|)|(&&))<type:(number|bool)@D,secret:true>'
      },
      value: {
        'Online Messages': 'p-1',
        'Online Rounds': '1'
      }
    },
    // comparison
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '<type:(number|bool)@D,secret:true>(<|>|<=|>=|==|!=)<type:(number|bool)@D,secret:true>'
      },
      value: {
        'Online Messages': 'b*(p-1)',
        'Online Rounds': 'b-1'
      }
    },
    // oblivIf
    {
      rule: {
        nodeType: 'OblivIf',
        match: '^@T?@T:@T'
      },
      value: {
        'Online Messages': 'p-1',
        'Online Rounds': '1'
      }
    },
    // .len has no rounds
    {
      rule: {
        nodeType: 'DotExpression',
        match: '<type:array@D,secret:(true|false)>\\.len'
      },
      value: {
        'Online Messages': '=0',
        'Online Rounds': '=0'
      }
    },
    // array access at secret index
    {
      rule: {
        nodeType: 'ArrayAccess',
        match: '<type:array@D,secret:(true|false)>\\[<type:[a-zA-Z_]+@D,secret:true>\\]'
      },
      value: {
        'Online Messages': function (node, metric, pathStr, childrenType, childrenMetric) {
          const accessLength = childrenType.array.dependentType.length;
          console.log('(b*(p-1) + 1)' + accessLength.toString());
          return '(b*(p-1) + 1)' + accessLength.toString(); // n comparisons and obliv ifs
        },
        'Online Rounds': 'b' // one comparison + one obliv if
      }
    },
    // .push modifies the cost of the array as a side effect
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:array@D,secret:(true|false)>\\.push\\(@T\\)'
      },
      value: {
        'Online Messages': function (node, metric, pathStr, childrenType, childrenMetric) {
          if (node.function.left.nodeType === 'NameExpression') {
            const arrayName = node.function.left.name;
            this.setMetricWithConditions(arrayName, this.metric.store(metric));
          }
          return undefined;
        },
        'Online Rounds': function (node, metric, pathStr, childrenType, childrenMetric) {
          if (node.function.left.nodeType === 'NameExpression') {
            const arrayName = node.function.left.name;
            this.setMetricWithConditions(arrayName, this.metric.store(metric));
          }
          return undefined;
        }
      }
    },
    // .pop has no cost
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:array@D,secret:(true|false)>\\.push\\(@T\\)'
      },
      value: {
        'Online Messages': '=0',
        'Online Rounds': '=0'
      }
    }
  ]
};