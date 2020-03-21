FILE?="tests/test_program.rs"

test:
	@mkdir -p output
	cargo run $(FILE) > output/$$(basename $(FILE)).json
	@echo ""
	@echo ""
	node ../test/testIR.js ../rust/output/$$(basename $(FILE)).json