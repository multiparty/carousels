const IR = require('../../docs/merge_sort_dedup_ir.json');
// TODO: require wasm bundle from rust/dist/bundle.js and use it to parse into IR
const parseRust = function (code) {
  return IR;
};

module.exports = parseRust;