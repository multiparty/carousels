use serde::{Serialize, Deserialize};
use std::fmt::Debug;
use ir_node_derive::IRNode;

#[typetag::serde(tag = "type")]
trait IRNode: Debug {
    fn node_type(&self) -> &str;
}

#[derive(Serialize, Deserialize, Debug, IRNode)]
struct TypeNode {
    secret: bool,
    #[serde(rename = "type")]
    type_: String
}

fn main() {
    let type_node = TypeNode { secret: false, type_: "Test Type".to_string()};
    let serialized = serde_json::to_string(&type_node).unwrap();
    println!("serialized = {:?} ", serialized);
    println!("node type = {}", type_node.node_type());
}