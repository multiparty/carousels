const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const Analyzer = require('./analyze/analyzer.js');

module.exports = {
  languages: ['javascript', 'rust'],
  costs: costs,
  Analyzer: Analyzer,
  promise: parsers.promise,
  parsers: parsers // TODO: remove this after debugging
};