use carousels::visitor;

// This is not the entry point to our Rust-WASM library
//
// This file will not be compiled to WASM.
//
// This file is only used for rust command line testing/debugging
//
// Use `cargo run --bin main` to compile and run this file

pub fn main() {
    let args: Vec<String> = std::env::args().collect();

    let filename = &args[1];

    /*
     *let file = visitor::get_ast(&filename);
     *match file {
     *    Ok(_v)=>{println!("{}", serde_json::to_string(&_v).unwrap());},
     *    Err(e) => println!("error parsing : {:?}", e),
     *};
     */

    let file_str = visitor::file::get_ast_str_from_file(&filename);
    match file_str {
        Ok(_v)=>{println!("{}", _v);},
        Err(e) => println!("error parsing : {:?}", e),
    };
}
