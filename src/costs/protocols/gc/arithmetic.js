const combinators = require('../../utils/combinator.js');

module.exports = function (metrics, primitives) {
  // curry combinator
  const combinator = combinators.$Combinator.bind(null, metrics, primitives);

  primitives['add'] = combinator('b*(2*$and$ + 3*$xor$) + $xor$ + $and$');
  primitives['mult'] = combinator('b*(b*$mux$ + $add$)');
  primitives['div'] = combinator('b*($add$ + $not$ + b*$mux$)');
  primitives['lt'] = combinator('b*(2*$xor$ + 2*$not$ + 2*$and$)');
  primitives['eq'] = combinator('b*($xor$ + $or$)');
  primitives['if_else'] = combinator('b*$mux$'); // b-bits numbers

  return primitives;
};