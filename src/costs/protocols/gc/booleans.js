const combinators = require('../../utils/combinator.js');

module.exports = function (metrics, primitives) {
  const $Combinator = combinators.$Combinator.bind(Object.keys(primitives['ZERO']), primitives);

  primitives['xor'] = primitives['and'];
  primitives['or'] = $Combinator('3*$not$ + $and$');
  primitives['mux'] = $Combinator('2*$and$ + $xor$ + $not$');

  return primitives;
};