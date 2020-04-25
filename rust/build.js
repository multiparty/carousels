// run this after running wasm-pack
const fs = require('fs');
const path = require('path');

const FILES = {
  WASM_BG: 'index_bg.wasm',
  WASM_INDEX: 'index.js',
  BUNDLE_OUT: process.argv[3]
};

const wasmPath = path.join(__dirname, process.argv[2]);

console.log('Building WASM bundle');
console.log('Reading WASM files from', wasmPath);
console.log('Writing bundle file to', wasmPath);
if (!fs.existsSync(wasmPath)) {
  throw new Error('WASM directory does not exist\n' +
    'Make sure you are using build.sh correctly\n'+
    'Or run wasm-pack if building manually');
}

const wasmBinaryPath = path.join(wasmPath, FILES.WASM_BG);
const bundleOutputPath = path.join(wasmPath, FILES.BUNDLE_OUT);

const buffer = fs.readFileSync(wasmBinaryPath);
const string = buffer.toString('base64');

let generatedBundle = `
// will use this only if in node.js
const nodejsRequire = require;

// Generated Code
// will add wasm_bindgen to this scope
${fs.readFileSync(path.join(wasmPath, FILES.WASM_INDEX)).toString()}

// wasm_bindgen is now available as a local variable
const wasmBinary = (function (base64String) {
  const atob = (typeof(window) !== 'undefined' && window.atob) ? window.atob : nodejsRequire('atob');
  var raw = atob(base64String);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
})('${string}');

const wasmModule = new WebAssembly.Module(wasmBinary);
const wasmPromise = wasm_bindgen(wasmModule).then(function () {
  // our JS code should use the wrapped versions of exposed API,
  // not the internal wasm one
  return wasm_bindgen;
});

module.exports = wasmPromise;
// End of Generated Code
`;

generatedBundle = generatedBundle.trim();

console.log('Write bundle');
fs.writeFileSync(bundleOutputPath, generatedBundle);

console.log('done');
