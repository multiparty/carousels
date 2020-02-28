#!/bin/bash

# remove tmp and dist folders
rm -rf tmp dist
mkdir -p dist

# use wasm pack to generate no-modules (manual import) WASM binaries
echo "Compiling with wasm-pack"
wasm-pack build . --out-dir tmp --out-name index --target no-modules
echo ""
echo ""
echo ""

# generate our own wrapper with the binary injected in it
echo "Building our own packing"
node build.js tmp dist

# remove tmp folder
rm -rf tmp

# TODO: remove this when integrated with top-level browserify
browserify dist/bundle.js -o static/bundle.js --s rust
