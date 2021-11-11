FILE?="tests/test_simple.rs"

RUST_MAIN := src/bin/main.rs
RUST_SRCS := $(wildcard src/*.rs src/visitor/*.rs ir_node_derive/src/*.rs)
TESTS := $(wildcard tests/*.rs)

.PHONY: build
build: orust.js

orust.js: build.js dist
	@echo "Building our own packing"
	node build.js dist orust.js
	@echo ""
	@echo ""
	@echo ""
	@echo "Complete wrapped library produced at orust.js"

dist: $(RUST_SRCS)
	@echo "Compiling with wasm-pack"
	wasm-pack build . --out-dir dist --out-name index --target no-modules
	@echo ""
	@echo ""
	@echo ""

.PHONY: test
test: $(TESTS) $(RUST_MAIN)
	@mkdir -p output
	cargo run $(FILE) > output/$$(basename $(FILE)).json
	@echo ""
	@echo ""
	node ../test/testIR.js ../rust/output/$$(basename $(FILE)).json

.PHONY: clean
clean:
	rm -rf dist/ target/ orust.js
