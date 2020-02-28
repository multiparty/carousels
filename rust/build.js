// run this after running wasm-pack
const fs = require('fs');
const path = require('path');

const FILES = {
  WASM: 'index_bg.wasm',
  WRAPPER: 'index.js',
  WRAPPER_OUT: 'wrapper.js',
  BUNDLE_OUT: 'bundle.js'
};

const wasmPath = path.join(__dirname, process.argv[2]);
const outputPath = path.join(__dirname, process.argv[3]);

console.log('Building WASM bundle');
console.log('Reading WASM files from', wasmPath);
console.log('Writing bundle files to', outputPath);
if (!fs.existsSync(wasmPath)) {
  throw new Error('WASM directory does not exist\n' +
    'Make sure you are using build.sh correctly\n'+
    'Or run wasm-pack if building manually');
}

const wasmBinaryPath = path.join(wasmPath, FILES.WASM);
const wrapperPath = path.join(wasmPath, FILES.WRAPPER);
const wrapperCopyPath = path.join(outputPath, FILES.WRAPPER_OUT);
const bundleOutputPath = path.join(outputPath, FILES.BUNDLE_OUT);

console.log('Copy wrapper');
fs.copyFileSync(wrapperPath, wrapperCopyPath);

const buffer = fs.readFileSync(wasmBinaryPath);
const string = buffer.toString('base64');

let generatedBundle = `
  // Generated Code
  require('./${FILES.WRAPPER_OUT}'); // will add wasm_bindgen to global scope

  module.exports = function () {
    const wasmBinary = (function (base64String) {
      var raw = window.atob(base64String);
      var rawLength = raw.length;
      var array = new Uint8Array(new ArrayBuffer(rawLength));

      for(i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
      }
      return array;
    })('${string}');

    const wasmModule = new WebAssembly.Module(wasmBinary);
    const wasmPromise = wasm_bindgen(wasmModule);
    return wasmPromise;
  };
  // End of Generated Code
`;

generatedBundle = generatedBundle.trim().replace(/\\n\ \ /g, '\n');

console.log('Write bundle');
fs.writeFileSync(bundleOutputPath, generatedBundle);

console.log('done');
