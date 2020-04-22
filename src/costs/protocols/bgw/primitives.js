module.exports = {
  ZERO: {
    'Network Bits': '=0',
    'Network Rounds': '=0',
    'Logical Gates': '=0',
    'Total Memory': '=0',
    'Memory Access': '=0',
    'CPU': '=0'
  },
  cadd: {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  },
  sadd: {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  },
  cmult: {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  },
  smult: {
    'Network Bits': '(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '1',
    'Total Memory': '(p+1)*b',
    'Memory Access': 'p+5',
    'CPU': '1'
  },
  open: {
    'Network Bits': '(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '1',
    'Total Memory': '(p-1)*b',
    'Memory Access': 'p',
    'CPU': '1'
  },
  if_else: {
    'Network Bits': '(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '5',
    'Total Memory': '(p+3)*b',
    'Memory Access': 'p+12',
    'CPU': '1'
  }
};