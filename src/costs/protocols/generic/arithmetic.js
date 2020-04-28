const combinators = require('../../utils/combinator.js');

module.exports = function (metrics, primitives) {
  // arithmetic operations include all primitives except open and if_else
  const arithmetic = Object.assign({}, primitives);

  // curry combinator
  const combinator = combinators.$Combinator.bind(null, metrics, arithmetic);

  // internal -------
  arithmetic['clt_bits'] = combinator('(b+4)*$cmult$ + (b-1)*$smult$ + (b+2)*$sadd$');
  arithmetic['clt_bits']['Network Rounds'] = combinator('(b-1)*$smult$', 'Network Rounds');

  arithmetic['half_prime'] = combinator('3*$cmult$ + $sadd$ + $smult$ + $open$ + $clt_bits$');
  arithmetic['half_prime']['Network Rounds'] = combinator('$smult$ + $open$ + $clt_bits', 'Network Rounds');
  // ------- end of internal

  // constant less than
  arithmetic['clt'] = combinator('2*$half_prime$ + 3*$cadd$ + 3*$sadd$ + 2*$cmult$ + $smult$');
  arithmetic['clt']['Network Rounds'] = combinator('$half_prime$ + $smult$', 'Network Rounds');

  // secret less than
  arithmetic['slt'] = combinator('3*$half_prime$ + $cadd$ + 5*$sadd$ + $cmult$ + 2*$smult$');
  arithmetic['slt']['Network Rounds'] = combinator('$half_prime$ + $smult$', 'Network Rounds');

  // constant division
  arithmetic['cdiv'] = combinator('4*$clt$ + $if_else$ + $open$ + $smult$ + 5*$sadd$ + 2*$cadd$ + $cmult$');
  arithmetic['cdiv']['Network Rounds'] = combinator('$open$ + 2*$clt$ + $if_else$ + $smult$', 'Network Rounds');

  // secret division
  arithmetic['sdiv'] = combinator('b*($cmult$ + $clt$ + $slt$ + 2*$smult$ + 2*$sadd$)');
  arithmetic['sdiv']['Network Rounds'] = combinator('b*$slt$ + 2*b*$smult$', 'Network Rounds');

  // GC has its own sor and sxor, other protocols rely on smult
  if (arithmetic['sor'] == null) {
    arithmetic['sor'] = arithmetic['or'] ? arithmetic['or'] : arithmetic['smult'];
  }
  if (arithmetic['sxor'] == null) {
    arithmetic['sxor'] = arithmetic['xor'] ? arithmetic['xor'] : arithmetic['smult'];
  }

  // delete un-needed/internal abstractions
  delete arithmetic['open'];
  delete arithmetic['if_else'];
  delete arithmetic['clt_bits'];
  delete arithmetic['half_prime'];

  return arithmetic;
};