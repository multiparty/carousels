// helpers to simplify expressing costs
const primitives = {
  ZERO: {
    'Network': '=0',
    'Garbled Gates': '=0',
    'Total Memory': '=0',
    'Memory Access': '=0',
    'CPU Garbler': '=0',
    'CPU Evaluator': '=0'
  }
};
primitives['and'] = {
  'Network': '4*s',
  'Garbled Gates': '1',
  'Total Memory': '8*s + 2',
  'Memory Access': '3',
  'CPU Garbler': '4*RNG + 8*AES + 10*s + 2',
  'CPU Evaluator': '2*AES + 28*s'
};
primitives['not'] = {
  'Network': '2*s',
  'Garbled Gates': '1',
  'Total Memory': '4*s + 1',
  'Memory Access': '2',
  'CPU Garbler': '2*RNG + 4*AES + 5*s + 1',
  'CPU Evaluator': 'AES + 16*s'
};
primitives['xor'] = primitives['and'];

const OP_REGEX = function (ops) {
  return '(<type:(number|bool)@D,secret:true>(' + ops + ')<type:(number|bool)@D,secret:true>)|' +
  '(<type:(number|bool)@D,secret:false>(' + ops + ')<type:(number|bool)@D,secret:true>)|' +
  '(<type:(number|bool)@D,secret:true>(' + ops + ')<type:(number|bool)@D,secret:false>)';
};

const combinator = function (expr) {
  const result = {};
  for (const p in primitives['and']) {
    if (!Object.prototype.hasOwnProperty.call(primitives['and'], p)) {
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

primitives['or'] = combinator('3*$not$ + $and$');
primitives['mux'] = combinator('2*$and$ + $xor$ + $not$');
primitives['add'] = combinator('b*(2*$and$ + 3*$xor$) + $xor$ + $and$');

const arrayAccessFunc = function () {
  const result = {};
  for (const p in primitives['and']) {
    if (!Object.prototype.hasOwnProperty.call(primitives['and'], p)) {
      continue;
    }

    result[p] = (function (p) {
      return function (node, metric, pathStr, childrenType, childrenMetric) {
        const accessLength = childrenType.array.dependentType.length;
        return module.exports.operations[8][p] + ' + ' + module.exports.operations[7][p] + ' + ' + accessLength.toString(); // length many if_else/obliv if and ==
      }
    })(p);
  }

  return result;
};

// costs
module.exports = {
  parameters: [
    {symbol: 'b', description: 'input size in bits (of a single input: i.e. size of a number)'},
    {symbol: 's', description: 'security parameter (lambda)'},
    {symbol: 'RNG', description: 'CPU Cycle costs for RNG(s)'},
    {symbol: 'AES', description: 'CPU Cycle costs for AES(s)'}
  ],
  metrics: [
    {
      title: 'Network',
      description: 'Total number of bits sent by both parties',
      type: 'TotalMetric'
    },
    {
      title: 'Garbled Gates',
      description: 'Total number of garbled gates in the resulting circuit',
      type: 'TotalMetric'
    },
    {
      title: 'Total Memory',
      description: 'Total number of bits stored in memory through all of the execution',
      type: 'TotalMetric'
    },
    {
      title: 'Memory Access',
      description: 'How many times memory was accessed',
      type: 'TotalMetric'
    },
    {
      title: 'CPU Garbler',
      description: 'Estimated CPU cycles for garbler',
      type: 'TotalMetric'
    },
    {
      title: 'CPU Evaluator',
      description: 'Estimated CPU cycles for evaluator',
      type: 'TotalMetric'
    }
  ],
  operations: [
    // ANDS, XORS
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('(&&)|\\^|(\\^\\^)')
      },
      value: primitives['and']
    },
    // NOT
    {
      rule: {
        nodeType: 'DirectExpression',
        match: '!<type:(number|bool)@D,secret:true>'
      },
      value: primitives['not']
    },
    // OR
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('\\|\\|')
      },
      value: primitives['or']
    },
    // +
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('\\+||-')
      },
      value: primitives['add']
    },
    // *
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('\\*')
      },
      value: combinator('b*(b*$mux$ + $add$)')
    },
    // / and mod
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('%|/')
      },
      value: combinator('b*($add$ + $not$ + b*$mux$)')
    },
    // <
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('<|(<=)|>|(>=)')
      },
      value: combinator('b*(2*$xor$ + 2*$not$ + 2*$and$)')
    },
    // ==
    {
      rule: {
        nodeType: 'DirectExpression',
        match: OP_REGEX('(&&)|\\^|(\\^\\^)')
      },
      value: combinator('b*($xor$ + $or$)')
    },
    // oblivIf on b-bits numbers
    {
      rule: {
        nodeType: 'OblivIf',
        match: '^@T?@T:@T'
      },
      value: combinator('b*$mux$')
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
      value: arrayAccessFunc()
    }
  ]
};