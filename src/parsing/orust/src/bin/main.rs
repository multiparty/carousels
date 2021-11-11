use carousels::visitor;

use std::fs::File as FileSys;
use std::io::Read;

// This is not the entry point to our Rust-WASM library
//
// This file will not be compiled to WASM.
//
// This file is only used for rust command line testing/debugging
//
// Use `cargo run --bin main` to compile and run this file

pub fn main() {
    // reading command line argument
    let args: Vec<String> = std::env::args().collect();
    let filename = &args[1]; // input file

    // read content of input file
    let mut file = FileSys::open(filename).unwrap();
    let mut content = String::new();
    file.read_to_string(&mut content).unwrap();

    // parse input code into IRNode
    let ir_node = visitor::file::get_ast(&content).unwrap();

    // pretty print
    match serde_json::to_string_pretty(&ir_node) {
        Ok(v) => {
            println!("{}", v);
        },
        Err(e) => {
            println!("{}", e);
        }
    }
}
