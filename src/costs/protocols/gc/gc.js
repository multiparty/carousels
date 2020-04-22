const primitiveCosts = require('./primitives.js');

const booleans = require('./booleans.js');
const arithmetic = require('./arithmetic.js');
const relational = require('./relational.js');

module.exports = function (metrics) {
  // get all the primitives together
  const primitives = Object.assign({}, primitiveCosts);
  booleans(metrics, primitives);
  arithmetic(metrics, primitives);
  relational(metrics, primitives);

  // keep only useful ones and add both constant and secret versions (it is the same in GC!)
  const costs = {
    ZERO: primitives['ZERO'],
    not: primitives['not'],
    if_else: primitives['if_else']
  };

  const operations = ['and', 'or', 'xor', 'add', 'mult', 'div', 'lt', 'eq'];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    costs['c' + op] = primitives[op];
    costs['s' + op] = primitives[op];
  }

  return costs;
};
