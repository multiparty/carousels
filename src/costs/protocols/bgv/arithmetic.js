const $Combinator = require('./combinator.js');

module.exports = function (metrics, primitives) {
  // arithmetic operations include all primitives
  const arithmetic = Object.assign({}, primitives);

  // curry combinator
  const combinator = $Combinator.bind(null, metrics, arithmetic);

  // internal -------
  arithmetic['clt_bits'] = combinator(['(b-1)*$smult$', '(b+4)*$cmult$ + (b-1)*$smult$ + (b+2)*$sadd$', '0']);
  arithmetic['half_prime'] = combinator(['$smult$ + $clt_bits', '3*$cmult$ + $sadd$ + $smult$ + $clt_bits$', '0']);
  // ------- end of internal

  // constant less than
  arithmetic['clt'] = combinator(['$half_prime$ + $smult$', '2*$half_prime$ + 3*$cadd$ + 3*$sadd$ + 2*$cmult$ + $smult$', '0']);
  // secret less than
  arithmetic['slt'] = combinator(['$half_prime$ + $smult$', '3*$half_prime$ + $cadd$ + 5*$sadd$ + $cmult$ + 2*$smult$', '0']);

  // constant division
  arithmetic['cdiv'] = combinator(['2*$clt$ + $if_else$ + $smult$', '4*$clt$ + $if_else$ + $smult$ + 5*$sadd$ + 2*$cadd$ + $cmult$', '0']);
  // secret division
  arithmetic['sdiv'] = combinator(['b*$slt$ + 2*b*$smult$', 'b*($cmult$ + $clt$ + $slt$ + 2*$smult$ + 2*$sadd$)', '0']);

  // GC has its own sor and sxor, other protocols rely on smult
  if (arithmetic['sor'] == null) {
    arithmetic['sor'] = arithmetic['or'] ? arithmetic['or'] : arithmetic['smult'];
  }
  if (arithmetic['sxor'] == null) {
    arithmetic['sxor'] = arithmetic['xor'] ? arithmetic['xor'] : arithmetic['smult'];
  }

  // delete un-needed/internal abstractions
  const result = Object.assign({}, arithmetic);
  delete result['if_else'];
  delete result['clt_bits'];
  delete result['half_prime'];

  return result;
};