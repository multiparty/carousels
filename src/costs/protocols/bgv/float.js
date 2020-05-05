const $Combinator = require('./combinator.js');

// l-bit significand & k-bit exponent
const l = 53;
const k = 10;
const m = 5; // floor(log2(l))
const sqrtLog = 3; // floor(log2(l / 5.4))

module.exports = function (metrics, primitives, arithmetic) {
  // float operations include all primitives
  const float = Object.assign({}, primitives, arithmetic);

  // curry combinator
  const combinator = $Combinator.bind(null, metrics, float);

  // random bits and random bit-wise decomposed numbers
  float['rand_bit'] = combinator(['$smult$', '$smult$', '0']);
  float['rand_m'] = function (m) {
    return m + '*$rand_bit$';
  };

  // primitives
  const mod2Expr = float['rand_m']('1') + '3*$sadd$ + 2*$cmult$';
  float['mod2'] = combinator([mod2Expr, mod2Expr, '0']);
  float['inv'] = combinator(['$smult$', '$smult$', '0']);
  float['bitLt'] = function (m) {
    return m + '*$sor$';
  };
  float['mod2m'] = function (k, m) {
    return float['rand_m'](k+'*'+m) + '+ 5*$sadd$ + 2*$cmult$ + ' + float['bitLt'](m);
  };
  float['trunc'] = function (k, m) {
    return float['mod2m'](k, m) + ' + $sadd$ + $cmult$';
  };
  float['eqz'] = function (k) {
    return float['rand_m'](k) + ' + (2+' + k + ')*$sadd$ + ' + k + '*$cmult$ + ' + k + '*$sor$';
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
    return m + '*$rand_bit$ + (' + m + ' + 2)*$sadd$ + ' + float['bitadd'](m);
  };
  float['pow2'] = function (m) {
    return float['bit_decomp'](m) + ' + ' + m + '*$smult$ + 2*' + m + '*$sadd$';
  };
  float['div'] = function (m) {
    return '(2*' + m + ' + 1)*(' + float['trunc']('2*' + l + ' + 1', l) + ' + $smult$)';
  };

  // Finally, operations!
  const addfExpr = '2*' + float['lt'](k) + ' + ' + float['lt'](l) + ' + $sxor$ + ' + float['eq'](k) + ' + 43*$smult$ + (2*' + l + ' + 22)*$sadd$ + $inv$ + '
    + float['trunc']('2*' + l + ' + 1', l + ' - 1') + ' + ' + float['trunc'](l + ' + 2', '2') + ' + ' + float['bit_decomp'](l + ' + 2', l + ' + 2')
    + ' + ' + float['eqz'](l) + float['pow2'](m); // floor(log2(l)) = floor(log2(l+1)) for l = 53
  float['addf'] = combinator([addfExpr, addfExpr, '0']);

  const multfExpr = '4*$smult$ + 3*$sadd$ + $sor$ + $sxor$ + ' + float['trunc']('2*'+l, l + ' - 1') +
    ' + ' + float['trunc'](l + ' + 1', l) + ' + ' + float['lt'](l + ' + 1');
  float['multf'] = combinator([multfExpr, multfExpr, '0']);

  const divfExpr = '5*$sadd$ + 3*$smult$ + $sxor$ + ' + float['div'](m) + ' + '
    + float['lt'](l + ' + 1') + ' + ' + float['trunc'](l + ' + 1', '1');
  float['divf'] = combinator([divfExpr, divfExpr, '0']);

  const ltfExpr = '17*$smult$ + 11*$sadd$ + ' + float['lt'](k) + ' + ' + float['lt'](l + ' + 1') + ' + ' + float['eq'](k);
  float['ltf'] = combinator([ltfExpr, ltfExpr, '0']);

  const sqrtfExpr = '$sadd$ + ' + float['bit_decomp'](l) + ' (5+4*' + sqrtLog + ')*$multf$ + (2 + ' + sqrtLog + ')*$addf$';
  float['sqrtf'] = combinator([sqrtfExpr, sqrtfExpr, '0']);

  return {
    addf: float['addf'],
    multf: float['multf'],
    divf: float['divf'],
    ltf: float['ltf'],
    sqrtf: float['sqrtf']
  };
};
