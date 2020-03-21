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

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

pub mod ir;
pub mod visitor;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
// If you don't want to use `wee_alloc`, you can safely delete this.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Testing WASM build using this stupid function
#[wasm_bindgen]
pub fn test_wasm_now() -> u32 {
    10
}

#[wasm_bindgen]
pub fn get_json_ir(code: &str) -> String {
    // parse code and return it as an IRNode struct
    let ir_node = visitor::file::get_ast(code);
    
    match ir_node {
      Ok(ir_node) => {
          // dump struct to json format
          match serde_json::to_string_pretty(&ir_node) {
              Ok(v) => {
                v
              },
              Err(e) => {
                format!("{{\"error\": \"{}\"}}", e.to_string())
              }
          }
      },
      Err(e) => {
          format!("{{\"error\": \"{}\"}}", e.to_string())
      }
    }    
}
