const rust = require('./parsers/rust/index.js');
const javascript = require('./parsers/javascript/index.js');

module.exports = {
  rust: rust.parse,
  javascript: javascript,
  promise: rust.promise
};