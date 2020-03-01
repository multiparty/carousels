#!/bin/bash

# remove tmp folder
rm -rf dist

# use wasm pack to generate no-modules (manual import) WASM binaries
echo "Compiling with wasm-pack"
wasm-pack build . --out-dir dist --out-name index --target no-modules
echo ""
echo ""
echo ""

# generate our own wrapper with the binary injected in it
echo "Building our own packing"
node build.js dist wasm.js
