const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const analyze = require('./analyze/analyze.js');

module.exports = {
  costs: costs,
  parsers: parsers,
  analyze: analyze
};