const WASMParser = require('../../../../rust/js/wrapper.js');

const parseRust = function (code) {
  console.log('test_wasm_now() = ', WASMParser.parse(code));
  // TODO: require wasm bundle from rust/dist/bundle.js and use it to parse into IR
  return require('../../../../docs/merge_sort_dedup_ir.json');
};

module.exports = {
  parse: parseRust,
  promise: WASMParser.promise
};