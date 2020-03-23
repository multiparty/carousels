use crate::visitor::program::{Program};
use std::error::Error;
use std::result::Result;
use syn::visit::{Visit};

// Entry point to our visitor pattern
pub fn get_ast(code: &str) -> Result<Program, Box<dyn Error>> {
    let syntax = syn::parse_file(&code)?;

    let mut ir_file = Program{body: Vec::new()}; // highest node in the AST
    ir_file.visit_file(&syntax);
    Ok(ir_file)
}
