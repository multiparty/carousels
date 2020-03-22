// Module needs to be load dynamically (async) for WebAssembly to function
let WASMParser;

const WASMPromise = require('../dist/wasm.js');
WASMPromise.then(function (_WASMParser) {
  WASMParser = _WASMParser;
});

// Parsing Wrapper: preprocess code as a string to remove obliv keyword
const REPLACE_PATTERNS = [
  {
    pattern: new RegExp('else\\s+obliv\\s+if', 'g'),
    replace: 'else if'
  },
  {
    pattern: new RegExp('obliv\\s+if', 'g'),
    replace: '#[__obliv__]\nif'
  }
];

const parseWrapper = function (code) {
  if (WASMParser == null) {
    throw new Error('WASM binaries did not finish loading asynchronously yet! please make sure WASMPromise is resolved first!');
  }

  for (let i = 0; i < REPLACE_PATTERNS.length; i++) {
    const pattern = REPLACE_PATTERNS[i].pattern;
    const replace = REPLACE_PATTERNS[i].replace;
    code = code.replace(pattern, replace);
  }

  return WASMParser.get_json_ir(code);
};

module.exports = {
  promise: WASMPromise,
  parse: parseWrapper
};
