const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const Analyzer = require('./analyze/analyzer.js');
Analyzer.math = require('./analyze/math.js').lib;  // TODO: remove this after debugging

module.exports = {
  languages: ['javascript', 'rust'],
  costs: costs,
  Analyzer: Analyzer,
  promise: parsers.promise,
  parsers: parsers // TODO: remove this after debugging
};

console.log('Run carousels.Analyzer.math.enable_dynamic_programming() to turn on experimental caching');
