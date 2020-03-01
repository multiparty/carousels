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
// Generated Code
// will add wasm_bindgen to global scope
require('./${FILES.WASM_INDEX}');

// remove wasm_bindgen from global scope, make it only accessible in this file
const wasm_bindgen = window.wasm_bindgen;
delete window['wasm_bindgen'];

const wasmBinary = (function (base64String) {
  var raw = window.atob(base64String);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
})('${string}');

const wasmModule = new WebAssembly.Module(wasmBinary);
const wasmPromise = wasm_bindgen(wasmModule);

module.exports = wasmPromise;
// End of Generated Code
`;

generatedBundle = generatedBundle.trim();

console.log('Write bundle');
fs.writeFileSync(bundleOutputPath, generatedBundle);

console.log('done');
