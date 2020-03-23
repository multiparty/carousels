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

extern crate console_error_panic_hook;
use wasm_bindgen::prelude::*;

// Hook for handling errors
pub mod utils {
    pub fn set_panic_hook() {
        // When the `console_error_panic_hook` feature is enabled, we can call the
        // `set_panic_hook` function at least once during initialization, and then
        // we will get better error messages if our code ever panics.
        //
        // For more details see
        // https://github.com/rustwasm/console_error_panic_hook#readme
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();
    }
}

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

pub mod ir;
pub mod visitor;

// Testing WASM build using this stupid function
#[wasm_bindgen]
pub fn test_wasm_now() -> u32 {
    utils::set_panic_hook();
    10
}

#[wasm_bindgen]
pub fn get_json_ir(code: &str) -> String {
    utils::set_panic_hook();

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
