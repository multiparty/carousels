const combinators = require('../../utils/combinator.js');

module.exports = function (metrics, primitives) {
  // float operations include all primitives except open and if_else
  const float = Object.assign({}, primitives);

  // curry combinator
  const combinator = combinators.$Combinator.bind(null, metrics, arithmetic);


  // m is the input bit length, x is a generic input to the function


  // float['xor'] = combinator('2*$sadd$ + $smult$');
  // float['or'] = combinator('2*$sadd$ + $smult$');

  // float['mod_2'] = combinator('$rand_mf(x,1)$ + 3*$sadd$ + 2*$cmult$ + $open$');
  // float['bit_lt'] = combinator('m');
  // float['mod_2m'] =  combinator('$rand_mf(x,m)$ + 5*$sadd$ + 2*$cmult$ + $open$ + $bit_lt(m)$');

  // float['eqz'] = combinator('$rand_mf(x)$ + (2+x)*$sadd$ + x*$cmult$ + $open$ + x*$or$');
  // float['eq'] = combinator('$sub$ + $eqzf(x)$');
  // float['ltz'] = combinator('$trunc(x, x-1)$');
  // float['lt'] = combinator('$sub$ + $ltz(x)$');
  // float['bit_add'] = combinator('(2*m - 1)*$xor$ + (2*m - 2)*smult');

  // l-bit significand & k-bit exponent

  float['rand_bit'] = combinator('$cmult$ + $open$');
  float['rand_m'] = combinator('m*$rand_bit$');
  float['inv'] = combinator('$cmult$ + $open$');
  float['bit_decomp'] = combinator('m*$rand_bit$ + (m + 2)*$sadd$ + $open$ + $bit_add(m)$');
  float['trunc'] = combinator('$mod_2mf(x,m)$ + $sadd$ + $cmult$');

  float['pow2f'] = combinator('$bit_decomp(log(l))$ + log(l)*$smult$ + 2*log(l)*$sadd$');
  float['addf'] = combinator('2*$lt(k)$ + $lt(l)$ + $xor$ + $clt(k)$ + 43*$smult$ + (2*l + 22)*$sadd$ + $inv_f$ + $truncf(2*l+1, l-1)$ + $truncf(l+2, 2)$ + $bit_decomp(l+2, l+2)$ + clt(l)$ + $pow2f(l+1)$');
  float['mult'] = combinator('4*$smult$ + 3*$sadd$ + $truncf(2l, l-1)$ + $truncf(l+1, 1)$ + $lt(l+1)$ + $or$ + $xor$');
  float['divf'] = combinator('5*$sadd$ + 3*$smult$ + $sdiv(l)$ + $lt(l+1)$ + $truncf(l+1, 1)$ + $xor$');
  float['ltf'] = combinator('17*$smult$ + 11*$sadd$ + $lt(k)$ + $lt(l+1)$ + clt(k)$');
  float['sqrtf'] = combinator('$bit_decomp(l)$ + $sadd$ + (5 + 4*log(l/5.4))*$multf$ + (2 + *log(l/5.4))*$multf$');

  // delete un-needed/internal abstractions
  delete float['if_else'];
  delete float['clt_bits'];
  delete float['half_prime'];

  return float;
};
