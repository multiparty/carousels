const combinators = require('../../utils/combinator.js');

// l-bit significand & k-bit exponent
const l = 53;
const k = 10;
const m = 5; // floor(log2(l))
const sqrtLog = 3; // floor(log2(l / 5.4))

module.exports = function (metrics, primitives, arithmetic) {
  // float operations include all primitives except open and if_else
  const float = Object.assign({}, primitives, arithmetic);

  // curry combinator
  const combinator = combinators.$Combinator.bind(null, metrics, float);

  // random bits and random bit-wise decomposed numbers
  float['rand_bit'] = combinator('$smult$ + $open$');
  float['rand_m'] = function (m) {
    return m + '*$rand_bit$';
  };

  // primitives
  float['inv'] = combinator('$smult$ + $open$');
  float['mod2'] = combinator(float['rand_m']('1') + '3*$sadd$ + 2*$cmult$ + $open$');
  float['bitLt'] = function (m) {
    return m + '*$sor$';
  };
  float['mod2m'] = function (k, m) {
    return float['rand_m'](k+'*'+m) + '+ 5*$sadd$ + 2*$cmult$ + $open$ + ' + float['bitLt'](m);
  };
  float['trunc'] = function (k, m) {
    return float['mod2m'](k, m) + ' + $sadd$ + $cmult$';
  };
  float['eqz'] = function (k) {
    return float['rand_m'](k) + ' + (2+' + k + ')*$sadd$ + $open$ + ' + k + '*$cmult$ + ' + k + '*$sor$';
  };
  float['eq'] = function (k) {
    return '$sadd$ + ' + float['eqz'](k);
  };
  float['ltz'] = function (k) {
    return float['trunc'](k, '(' + k + ' - 1)');
  };
  float['lt'] = function (k) {
    return '$sadd$ + ' + float['ltz'](k);
  };
  float['bitadd'] = function (m) {
    return '(2*' + m +' - 1)*$sxor$ + (2*' + m + ' - 2)*$smult$';
  };
  float['bit_decomp'] = function (m) {
    return m + '*$rand_bit$ + (' + m + ' + 2)*$sadd$ + $open$ + ' + float['bitadd'](m);
  };
  float['pow2'] = function (m) {
    return float['bit_decomp'](m) + ' + ' + m + '*$smult$ + 2*' + m + '*$sadd$';
  };
  float['div'] = function (m) {
    return '(2*' + m + ' + 1)*(' + float['trunc']('2*' + l + ' + 1', l) + ' + $smult$)';
  };

  // Finally, operations!
  float['addf'] = combinator(
    '2*' + float['lt'](k) + ' + ' + float['lt'](l) + ' + $sxor$ + ' + float['eq'](k) + ' + 43*$smult$ + (2*' + l + ' + 22)*$sadd$ + $inv$ + '
    + float['trunc']('2*' + l + ' + 1', l + ' - 1') + ' + ' + float['trunc'](l + ' + 2', '2') + ' + ' + float['bit_decomp'](l + ' + 2', l + ' + 2')
    + ' + ' + float['eqz'](l) + float['pow2'](m) // floor(log2(l)) = floor(log2(l+1)) for l = 53
  );

  float['multf'] = combinator(
    '4*$smult$ + 3*$sadd$ + $sor$ + $sxor$ + '
    + float['trunc']('2*'+l, l + ' - 1') + ' + ' + float['trunc'](l + ' + 1', l) + ' + ' + float['lt'](l + ' + 1')
  );

  float['divf'] = combinator(
    '5*$sadd$ + 3*$smult$ + $sxor$ + ' + float['div'](m) + ' + '
    + float['lt'](l + ' + 1') + ' + ' + float['trunc'](l + ' + 1', '1')
  );

  float['ltf'] = combinator(
    '17*$smult$ + 11*$sadd$ + '
    + float['lt'](k) + ' + ' + float['lt'](l + ' + 1') + ' + ' + float['eq'](k)
  );

  float['sqrtf'] = combinator(
    '$sadd$ + ' + float['bit_decomp'](l) + ' (5+4*' + sqrtLog + ')*$multf$ + (2 + ' + sqrtLog + ')*$addf$'
  );

  return {
    addf: float['addf'],
    multf: float['multf'],
    divf: float['divf'],
    ltf: float['ltf'],
    sqrtf: float['sqrtf']
  };
};
