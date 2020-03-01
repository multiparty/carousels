use carousels::{TypeNode, NameExpression, FunctionDefinition};

// This is not the entry point to our Rust-WASM library
//
// This file will not be compiled to WASM.
//
// This file is only used for rust command line testing/debugging
//
// Use `cargo run --bin main` to compile and run this file

pub fn main() {
    let type_expression = TypeNode::new(false, "Test Type".to_string());
    let name_expression = NameExpression::new("f1".to_string());
    let function_def = FunctionDefinition::new(name_expression, Vec::new(), Vec::new(), type_expression);

    println!("{}", serde_json::to_string(&function_def).unwrap());
}