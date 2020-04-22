module.exports = function () {
  const primitives = {};

  // constant add
  primitives['cadd'] = {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  };
  // secret add
  primitives['sadd'] = {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  };
  // constant multiplication
  primitives['cmult'] = {
    'Network Bits': '0',
    'Network Rounds': '0',
    'Logical Gates': '1',
    'Total Memory': 'b',
    'Memory Access': '3',
    'CPU': '1'
  };
  // secret multiplication
  primitives['smult'] = {
    'Network Bits': '2*(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '36*b',
    'Total Memory': '2*p*b + 7*b',
    'Memory Access': '2*p + 17',
    'CPU': '1'
  };
  // open / leak
  primitives['open'] = {
    'Network Bits': '2*(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '1',
    'Total Memory': '2*p*b',
    'Memory Access': 'p',
    'CPU': '1'
  };
  // basic select/mux/if_else
  primitives['if_else'] = {
    'Network Bits': '2*(p-1)*b',
    'Network Rounds': '1',
    'Logical Gates': '180*b',
    'Total Memory': '(p+3)*b',
    'Memory Access': '2*p + 22',
    'CPU': '1'
  };

  return primitives;
};