module.exports = {
  ZERO: {
    'Network Bits': '=0',
    'Garbled Gates': '=0',
    'Total Memory': '=0',
    'Memory Access': '=0',
    'CPU Garbler': '=0',
    'CPU Evaluator': '=0'
  },
  and: {
    'Network Bits': '4*s',
    'Garbled Gates': '1',
    'Total Memory': '8*s + 2',
    'Memory Access': '3',
    'CPU Garbler': '4*RNG + 8*AES + 10*s + 2',
    'CPU Evaluator': '2*AES + 28*s'
  },
  not: {
    'Network Bits': '2*s',
    'Garbled Gates': '1',
    'Total Memory': '4*s + 1',
    'Memory Access': '2',
    'CPU Garbler': '2*RNG + 4*AES + 5*s + 1',
    'CPU Evaluator': 'AES + 16*s'
  },
  open: {
    'Network Bits': '0',
    'Garbled Gates': '0',
    'Total Memory': '0',
    'Memory Access': '0',
    'CPU Garbler': '0',
    'CPU Evaluator': '0'
  }
};

