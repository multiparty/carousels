// helpers to simplify expressing costs
const primitives = {
  ZERO: {
    'Network Bits': '=0',
    'Network Rounds': '=0',
    'Garbled Gates': '=0',
    'Total Memory': '=0',
    'Memory Access': '=0',
    'CPU': '=0'
  }
};
primitives['cadd'] = {
  'Network Bits': '0',
  'Network Rounds': '0',
  'Garbled Gates': '1',
  'Total Memory': '1',
  'Memory Access': '3',
  'CPU': '1'
};
primitives['sadd'] = {
  'Network Bits': '0',
  'Network Rounds': '0',
  'Garbled Gates': '1',
  'Total Memory': '1',
  'Memory Access': '3',
  'CPU': '1'
};
primitives['cmult'] = {
  'Network Bits': '0',
  'Network Rounds': '0',
  'Garbled Gates': '1',
  'Total Memory': '1',
  'Memory Access': '3',
  'CPU': '1'
};
primitives['smult'] = {
  'Network Bits': '(p-1)*b',
  'Network Rounds': '1',
  'Garbled Gates': '1',
  'Total Memory': 'p+1',
  'Memory Access': 'p+5',
  'CPU': '1'
};
primitives['open'] = {
  'Network Bits': '(p-1)*b',
  'Network Rounds': '1',
  'Garbled Gates': '1',
  'Total Memory': 'p-1',
  'Memory Access': 'p',
  'CPU': '1'
};
primitives['if_else'] = {
  'Network Bits': '(p-1)*b',
  'Network Rounds': '1',
  'Garbled Gates': '5',
  'Total Memory': 'p+3',
  'Memory Access': 'p+12',
  'CPU': '1'
};

const combinator = function (expr) {
  const result = {};
  for (const p in primitives['sadd']) {
    if (!Object.prototype.hasOwnProperty.call(primitives['sadd'], p)) {
      continue;
    }

    const str = [];
    const parts = expr.split('$');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i % 2 === 0) {
        str.push(part);
      } else {
        str.push('(' + primitives[part][p] + ')');
      }
    }
    result[p] = str.join('');
  }
  return result;
};

primitives['clt_bits'] = combinator('(b+4)*$cmult$ + (b-1)*$smult$ + (b+2)*$sadd$');
primitives['clt_bits']['Network Rounds'] = '(b-1)*('  + primitives['smult']['Network Rounds'] + ')';

primitives['half_prime'] = combinator('3*$cmult$ + $sadd$ + $smult$ + $open$ + $clt_bits$');
primitives['half_prime']['Network Rounds'] = primitives['smult']['Network Rounds'] + ' + ' +
  primitives['open']['Network Rounds'] + ' + ' +
  primitives['clt_bits']['Network Rounds'];

primitives['clt'] = combinator('2*$half_prime$ + 3*$cadd$ + 3*$sadd$ + 2*$cmult$ + $smult$');
primitives['clt']['Network Rounds'] = primitives['half_prime']['Network Rounds'] + ' + ' + primitives['smult']['Network Rounds'];

primitives['slt'] = combinator('3*$half_prime$ + $cadd$ + 5*$sadd$ + 1*$cmult$ + 2*$smult$');
primitives['slt']['Network Rounds'] = primitives['half_prime']['Network Rounds'] + ' + ' + primitives['smult']['Network Rounds'];

primitives['sdiv'] = combinator('b*($cmult$ + $clt$ + $slt$ + 2*$smult$ + 2*$sadd$)');
primitives['sdiv']['Network Rounds'] = 'b * (' + primitives['slt']['Network Rounds'] + ' + 2*(' + primitives['smult']['Network Rounds'] + '))';

const BOTH_SECRET_REGEX = function (ops) {
  return '<type:(number|bool)@D,secret:true>(' + ops + ')<type:(number|bool)@D,secret:true>';
};
const ONE_SECRET_REGEX = function (ops) {
  return '(<type:(number|bool)@D,secret:false>(' + ops + ')<type:(number|bool)@D,secret:true>)|' +
    '(<type:(number|bool)@D,secret:true>(' + ops + ')<type:(number|bool)@D,secret:false>)';
};

const combinatorFunc = function (func) {
  const result = {};
  for (const p in primitives['sadd']) {
    if (!Object.prototype.hasOwnProperty.call(primitives['sadd'], p)) {
      continue;
    }

    result[p] = (function (p) {
      return function (node, metric, pathStr, childrenType, childrenMetric) {
        return func.call(this, p, node, metric, pathStr, childrenType, childrenMetric);
      }
    })();
  }

  return result;
};

// costs
module.exports = {
  parameters: [
    {symbol: 'b', description: 'the size of the field, also the security parameter'},
    {symbol: 'p', description: 'the number of parties'},
  ],
  metrics: [
    {
      title: 'Network Bits',
      description: 'Total number of bits sent by a party',
      type: 'TotalMetric'
    },
    {
      title: 'Network Rounds',
      description: 'Number of network calls made by a party',
      type: 'RoundMetric'
    },
    {
      title: 'Logical Gates',
      description: 'Total number of logical primitives',
      type: 'TotalMetric'
    },
    {
      title: 'Total Memory',
      description: 'Total number of bits stored in memory through all of the execution'
    },
    {
      title: 'Memory Accesses',
      description: 'How many times memory was accessed',
      type: 'TotalMetric'
    },
    {
      title: 'CPU',
      description: 'Estimated CPU cycles for a party',
      type: 'TotalMetric'
    }
  ],
  operations: [
    // cadd/csub
    {
      rule: {
        nodeType: 'DirectExpression',
        match: ONE_SECRET_REGEX('\\+|-')
      },
      value: primitives['cadd']
    },
    // sadd/ssub
    {
      rule: {
        nodeType: 'DirectExpression',
        match: BOTH_SECRET_REGEX('\\+|-')
      },
      value: primitives['sadd']
    },
    // cmult, cxor, cor, cand, not
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(!<type:(number|bool)@D,secret:true>)|(' + ONE_SECRET_REGEX('\\*|(\\|\\|)|&&|(\\^\\^)') + ')'
      },
      value: primitives['cmult']
    },
    // smult, sxor, xor, sand
    {
      rule: {
        nodeType: 'DirectExpression',
        match: BOTH_SECRET_REGEX('\\*|(\\|\\|)|&&|(\\^\\^)')
      },
      value: primitives['smult']
    },
    // sdiv, smod, cdiv, cmod
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(' + BOTH_SECRET_REGEX('/|%') + ')|(' + ONE_SECRET_REGEX('/|%') + ')'
      },
      value: primitives['sdiv']
    },
    // seq, sneq, ceq, cneq, clt, clteq, cgt, cgteq
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '(' + ONE_SECRET_REGEX('<|>|(<=)|(>=)|(==)|(!=)') + ')|(' + BOTH_SECRET_REGEX('(==)|(!=)') + ')'
      },
      value: primitives['clt']
    },
    // slt, slteq, sgt, sgteq
    {
      rule: {
        nodeType: 'DirectExpression',
        match: BOTH_SECRET_REGEX('<|>|(<=)|(>=)')
      },
      value: primitives['slt']
    },
    // oblivIf on b-bits numbers
    {
      rule: {
        nodeType: 'OblivIf',
        match: '^@T?@T:@T'
      },
      value: primitives['if_else']
    },
    // general rust syntax and std library things
    // .len has no rounds
    {
      rule: {
        nodeType: 'DotExpression',
        match: '<type:array@D,secret:(true|false)>\\.len'
      },
      value: primitives['ZERO']
    },
    // array access at secret index
    {
      rule: {
        nodeType: 'ArrayAccess',
        match: '<type:array@D,secret:(true|false)>\\[<type:[a-zA-Z_]+@D,secret:true>\\]'
      },
      value: combinatorFunc(function (p, node, metric, pathStr, childrenType, childrenMetric) {
        const accessLength = childrenType.array.dependentType.length;
        return module.exports.operations[8][p] + ' + ' + +accessLength.toString(); // length many if_else/obliv if
      })
    },
    // .push modifies the cost of the array as a side effect
    {
      rule: {
        nodeType: 'FunctionCall',
        match: '<type:array@D,secret:(true|false)>\\.push\\(@T\\)'
      },
      value: combinatorFunc(function (p, node, metric, pathStr, childrenType, childrenMetric) {
        if (node.function.left.nodeType === 'NameExpression') {
          const arrayName = node.function.left.name;
          this.setMetricWithConditions(arrayName, this.metric.store(metric));
        }
        return undefined;
      })
    }
  ]
};