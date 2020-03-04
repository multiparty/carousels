const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const Analyzer = require('./analyze/analyzer.js');

const analyze = function (language, code, costs, metric, extraTyping) {
  const analyzer = new Analyzer(language, code, extraTyping);
  analyzer.analyze(costs, metric);
  return analyzer.symbolicResult();
};

module.exports = {
  languages: ['javascript', 'rust'],
  costs: costs,
  analyze: analyze,
  promise: parsers.promise,
  parsers: parsers // TODO: remove this after debugging
};