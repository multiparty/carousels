var ops = [
  'share',
  'open',
  'sadd',
  'ssub',
  'smult',
  'sdiv',
  'cadd',
  'csub',
  'cmult',
  'cdiv',
  'lt',
  'lteq',
  'gt',
  'gteq',
  'clt',
  'clteq',
  'c>gt' ,
  'cgteq',
  'eq',
  'neq',
  'ceq',
  'cneq',
  'if_else'
];

var costs = {
  onlineRounds : {
    'share': '1',
    'open': '2',

    'sadd': '0',
    'ssub': '0',
    'smult': '2',
    'sdiv':'b^2 + 5b',
    'if_else': '2', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': '2*(b+3)+5',

    'lt': '2*(b+3)',
    'lteq': '2*(b+3)',
    'gt': '2*(b+3)',
    'gteq': '2*(b+3)',

    'clt': '2*(b+3)',
    'clteq': '2*(b+3)',
    'c>gt' : '2*(b+3)',
    'cgteq': '2*(b+3)',

    'eq': '2*(b+4)',
    'neq': '2*(b+4)',

    'ceq': '2*(b+4)',
    'cneq': '2*(b+4)',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  },

  offlineRounds : {
    'share': '0',
    'open': '1',

    'sadd': '0',
    'ssub': '0',
    'smult': '2',
    'sdiv':'3',
    'if_else': '2', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': '3',

    'lt': '3',
    'lteq': '3',
    'gt': '3',
    'gteq': '3  ',

    'clt': '3',
    'clteq': '3',
    'c>gt': '3',
    'cgteq': '3',

    'eq': '3',
    'neq': '3',

    'ceq': '3',
    'cneq': '3',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  },

  onlineMsg : {
    'share': 'n^2', //should be s*r (senders*receivers, doing big oh)
    'open': 'n + n^2', // should be s(1+r)

    'sadd': '0',
    'ssub': '0',
    'smult': 'n*(n+1)', // 2n+n*(n-1)
    'sdiv':'b^2*n^2',
    'if_else': 'n*(n+1)', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': 'b*n^2',

    'lt': 'b*n^2',
    'lteq': 'b*n^2',
    'gt': 'b*n^2',
    'gteq': 'b*n^2',

    'clt': 'b*n^2',
    'clteq': 'b*n^2',
    'c>gt': 'b*n^2',
    'cgteq': 'b*n^2',

    'eq': 'b*n^2',
    'neq': 'b*n^2',

    'ceq': 'b*n^2',
    'cneq': 'b*n^2',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  },

  offlineMsg : {
    'share': '0',
    'open': 'n^2',

    'sadd': '0',
    'ssub': '0',
    'smult': '2*n*(n-1)',
    'sdiv':'2*b^2*(2*n+n^2)',
    'if_else': '2*n*(n-1)', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': '4*b*(2*n+n^2)',

    'lt': 'b*(2*n+n^2)',
    'lteq': 'b*(2*n+n^2)',
    'gt': 'b*(2*n+n^2)',
    'gteq': 'b*(2*n+n^2)',

    'clt': 'b*(2*n+n^2)',
    'clteq': 'b*(2*n+n^2)',
    'c>gt:': 'b*(2*n+n^2)',
    'cgteq': 'b*(2*n+n^2)',

    'eq': '2*b*(2*n+n^2)',
    'neq': '2*b*(2*n+n^2)',

    'ceq': '2*b*(2*n+n^2)',
    'cneq': '2*b*(2*n+n^2)',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  }
}


var costs_preProcessing = {
  onlineRounds :{
    'share': '1',
    'open': '1',

    'sadd': '0',
    'ssub': '0',
    'smult': '0',
    'sdiv':'0',
    'if_else': '0', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': '0',

    'lt': '3',
    'lteq': '3',
    'gt': '3',
    'gteq': '3  ',

    'clt': '3',
    'clteq': '3',
    'c>gt': '3',
    'cgteq': '3',

    'eq': '3',
    'neq': '3',

    'ceq': '3',
    'cneq': '3',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  },

  offlineRounds : {
    'share': '1',
    'open': '2',

    'sadd': '0',
    'ssub': '0',
    'smult': '2',
    'sdiv':'b^2 + 5b',
    'if_else': '2', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': '2*(b+3)+5',

    'lt': '2*(b+3)',
    'lteq': '2*(b+3)',
    'gt': '2*(b+3)',
    'gteq': '2*(b+3)',

    'clt': '2*(b+3)',
    'clteq': '2*(b+3)',
    'c>gt' : '2*(b+3)',
    'cgteq': '2*(b+3)',

    'eq': '2*(b+4)',
    'neq': '2*(b+4)',

    'ceq': '2*(b+4)',
    'cneq': '2*(b+4)',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  },

  onlineMsg : {

    'share': '1',
    'open': '2',

    'sadd': '0',
    'ssub': '0',
    'smult': '2',
    'sdiv':'b^2 + 5b',
    'if_else': '2', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': '2*(b+3)+5',

    'lt': '2*(b+3)',
    'lteq': '2*(b+3)',
    'gt': '2*(b+3)',
    'gteq': '2*(b+3)',

    'clt': '2*(b+3)',
    'clteq': '2*(b+3)',
    'c>gt' : '2*(b+3)',
    'cgteq': '2*(b+3)',

    'eq': '2*(b+4)',
    'neq': '2*(b+4)',

    'ceq': '2*(b+4)',
    'cneq': '2*(b+4)',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  },

  offlineMsg : {
    'share': 'n^2', //should be s*r (senders*receivers, doing big oh)
    'open': 'n + n^2', // should be s(1+r)

    'sadd': '0',
    'ssub': '0',
    'smult': 'n*(n+1)', // 2n+n*(n-1)
    'sdiv':'b^2*n^2',
    'if_else': 'n*(n+1)', // worst case smult ssub sadd, constant  smult csub cadd

    'cadd': '0',
    'csub': '0',
    'cmult': '0',
    'cdiv': 'b*n^2',

    'lt': 'b*n^2',
    'lteq': 'b*n^2',
    'gt': 'b*n^2',
    'gteq': 'b*n^2',

    'clt': 'b*n^2',
    'clteq': 'b*n^2',
    'c>gt': 'b*n^2',
    'cgteq': 'b*n^2',

    'eq': 'b*n^2',
    'neq': 'b*n^2',

    'ceq': 'b*n^2',
    'cneq': 'b*n^2',

    // Costs of operations in the open
    '+': '0',
    '-': '0',
    '*': '0',
    '/': '0',
    '>': '0',
    '<': '0',
    '>=': '0',
    '<=': '0',
    '==': '0',
    '!=': '0',
    'linspace': '0',
    'length': '0'
  }
}

module.exports = {
  ops: ops,
  costs: costs,
  costs_preProcessing: costs_preProcessing
}
