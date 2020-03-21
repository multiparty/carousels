const WASMParser = require('../../../../rust/js/wrapper.js');

const parseRust = function (code) {
  return JSON.parse(WASMParser.parse(code));
};

module.exports = {
  parse: parseRust,
  promise: WASMParser.promise
};