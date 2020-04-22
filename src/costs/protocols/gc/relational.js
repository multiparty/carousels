const combinators = require('../../utils/combinator.js');

module.exports = function (metrics, primitives) {
  // curry combinator
  const combinator = combinators.$Combinator.bind(null, metrics, primitives);

  primitives['lt'] = combinator('b*(2*$xor$ + 2*$not$ + 2*$and$)');
  primitives['eq'] = combinator('b*($xor$ + $or$)');
  primitives['if_else'] = combinator('b*$mux$'); // b-bits numbers

  return primitives;
};