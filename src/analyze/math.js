const _mathjs = require('mathjs');
const mathjs = _mathjs.create(_mathjs.all);

const evaluate = require('./math/evaluate.js');
const variableIsUsed = require('./math/used.js');

const operators = require('./math/operators.js')(mathjs);

const API = {
  parse: mathjs.parse,
  simplify: mathjs.simplify,
  evaluate: evaluate(mathjs),
  variableIsUsed: variableIsUsed
};

// fill in API from dependent files
Object.assign(API, operators.constants);
Object.assign(API, operators.functions);
Object.assign(API, operators.customOperators);
Object.assign(API, {
  // https://mathjs.org/docs/expressions/syntax.html
  add: operators.genericOperator('+', 'add', operators.constants.ZERO),
  sub: operators.genericOperator('-', 'subtract', operators.constants.ZERO),
  multiply: operators.genericOperator('*', 'multiply', operators.constants.ZERO),
  and: operators.genericOperator('and', 'and', operators.constants.TRUE),
  or: operators.genericOperator('or', 'or', operators.constants.TRUE),
  mod: operators.genericOperator('%', 'mod'),
  gt: operators.genericOperator('>', 'larger', operators.constants.ZERO),
  lt: operators.genericOperator('<', 'smaller', operators.constants.ZERO),
  gte: operators.genericOperator('>=', 'largerEq', operators.constants.ZERO),
  lte: operators.genericOperator('<=', 'smallerEq', operators.constants.ZERO),
  eq: operators.genericOperator('==', 'equal', operators.constants.ZERO),
  neq: operators.genericOperator('!=', 'Unequal', operators.constants.ZERO)
});
Object.assign(API, {
  arrayAccess: operators.arrayAccess
});

// expose API
module.exports = API;