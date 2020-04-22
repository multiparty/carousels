module.exports = {
  // nothing
  ZERO: {
    'Network Bits': '=0',
    'Network Rounds': '=0',
    'Logical Gates': '=0',
    'Total Memory': '=0',
    'Memory Access': '=0',
    'CPU': '=0'
  },
  // constant add
  cadd: {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  },
  // secret add
  sadd: {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  },
  // constant multiplication
  cmult: {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  },
  // secret multiplication
  smult: {
    'Network Bits': '2*(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '36*b',
    'Total Memory': '2*p*b + 7*b',
    'Memory Access': '2*p + 17',
    'CPU': '1'
  },
  // open / leak
  open: {
    'Network Bits': '2*(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '1',
    'Total Memory': '2*p*b',
    'Memory Access': 'p',
    'CPU': '1'
  },
  // basic select/mux/if_else
  if_else: {
    'Network Bits': '2*(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '180*b',
    'Total Memory': '(p+3)*b',
    'Memory Access': '2*p + 22',
    'CPU': '1'
  }
};