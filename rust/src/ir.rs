
// The entry point to our Rust-WASM library
//
// This file (and its dependencies) will be compiled by our build script
// to WASM.
//
// Functions with #[wasm_bindgen] macro will be exposed by the binaries
// to javascript.
//
// This file cannot be run from the command line (it has no main).
// `cargo run` will not work because this is a library project.
// Instead, use `cargo run --bin main` to compile and run the main function
// located at ./bin/main.rs for local tests.

use wasm_bindgen::prelude::*;
// use web_sys::console;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Testing WASM build using this stupid function
// TODO: remove this later
#[wasm_bindgen]
pub fn test_wasm_now() -> u32 {
    10
}

// Now the real code
// TODO: organize into files
use ir_node_derive::ir_node;

// Abstract trait
#[typetag::serde(tag = "type")]
pub trait IRNode: std::fmt::Debug { }

#[ir_node]
struct Program {
    body: Vec<Box<dyn IRNode>>
}


// Logical nodes
#[ir_node]
struct TypeNode {
    secret: bool,
    type_: String
}

// Statements
#[ir_node]
struct FunctionDefinition {
    name: NameExpression,
    parameters: Vec<VariableDefinition>,
    body: Vec<Box<dyn IRNode>>,
    return_type: TypeNode
}

#[ir_node]
struct ReturnStatement {
    expression: Box<dyn IRNode>
}
#[ir_node]
struct VariableDefinition {
    name: NameExpression,
    type_: TypeNode
}
#[ir_node]
struct ForEach {
    iterator: VariableDefinition,
    range: RangeExpression,
    body: Vec<Box<dyn IRNode>>
}
#[ir_node]
struct For {
    initial: Vec<Box<dyn IRNode>>,
    condition: Box<dyn IRNode>,
    increment: Vec<Box<dyn IRNode>>,
    body: Vec<Box<dyn IRNode>>,
}

// Expressions
#[ir_node]
struct VariableAssignment {
    name: NameExpression,
    expression: Box<dyn IRNode>
}

#[ir_node]
struct If {
    condition: Box<dyn IRNode>,
    if_body: Vec<Box<dyn IRNode>>,
    else_body: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct OblivIf {
    condition: Box<dyn IRNode>,
    if_body: Vec<Box<dyn IRNode>>,
    else_body: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct LiteralExpression {
    value: String,
    type_: String // "number", "boolean" or "string"
}

#[ir_node]
struct NameExpression {
    pub name: String
}

#[ir_node]
struct DirectExpression {
    operator: String,
    arity: u32,
    operands: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct ParenthesesExpression {
    expression: Box<dyn IRNode>
}

#[ir_node]
struct ArrayAccess {
    array: Box<dyn IRNode>,
    index: Box<dyn IRNode>
}

#[ir_node]
struct RangeExpression {
    start: Box<dyn IRNode>,
    end: Box<dyn IRNode>,
    increment: Option<Box<dyn IRNode>>
}

#[ir_node]
struct SliceExpression {
    array: Box<dyn IRNode>,
    index: RangeExpression
}

#[ir_node]
struct ArrayExpression {
    elements: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct FunctionCall {
    function: Box<dyn IRNode>, // either NameExpression or DotExpression
    parameters: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct DotExpression {
    left: Box<dyn IRNode>,
    right: NameExpression
}
