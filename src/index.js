const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const Analyzer = require('./analyze/analyzer.js');

const analyze = function (language, code, costs, extraTyping) {
  const analyzer = new Analyzer(language, code, costs, extraTyping);
  return analyzer.analyze();
};

module.exports = {
  languages: ['javascript', 'rust'],
  costs: costs,
  analyze: analyze,
  promise: parsers.promise,
  parsers: parsers // TODO: remove this after debugging
};