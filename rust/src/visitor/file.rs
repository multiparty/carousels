use crate::ir::{Program};

use std::fs::File as FileSys;
use std::io::Read;
use std::error::Error;
use syn::visit::{Visit};

static NUMERICTYPES: [&str; 8] = ["u8","u16","u32","u128","u128","u128","i32","i128"];

pub fn get_ast_str_from_file(val: &str) -> std::result::Result<String, Box<dyn Error>> {
    let mut file = FileSys::open(val).unwrap();
    let mut content = String::new();

    file.read_to_string(&mut content).unwrap();
    let syntax = syn::parse_file(&content)?;

    let mut file = Box::new(Program::new(Vec::new())); //highest node in the AST
    file.visit_file(&syntax);

    match serde_json::to_string_pretty(&file){
        Ok(_v)=>{Ok(_v.replace("type_", "type").replace("typeNode","type").replace("name_", "name").replace("nameNode", "name"))},
        Err(_e)=>{Ok("Error serializing".to_string())},
    }

}
/// for wasm use, returns just a String
pub fn get_ast_str(val: &str) -> String {
    let syntax = match syn::parse_file(&val){
        Ok(v) => v,
        Err(e) => {return "Error parsing rust code".to_string()},
    };

    let mut file = Box::new(Program::new(Vec::new())); //highest node in the AST
    file.visit_file(&syntax);

    match serde_json::to_string_pretty(&file){
        Ok(_v)=>{_v},
        Err(_e)=>{"Error serializing".to_string()},
    }

}

pub fn get_ast(val: &str) -> std::result::Result<Box<Program>, Box<dyn Error>> {
    let mut file = FileSys::open(val).unwrap();
    let mut content = String::new();

    file.read_to_string(&mut content).unwrap();
    //println!("{}", content);
    let syntax = syn::parse_file(&content)?;

    let mut file = Box::new(Program::new(Vec::new())); //highest node in the AST
    file.visit_file(&syntax);
    Ok(file)

}
