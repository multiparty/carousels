use serde::{Serialize, Deserialize};
use std::fmt::Debug;
use ir_node_derive::IRNode;

trait IRNode: Debug {
    fn node_type(&self) -> &str;
}



#[derive(Serialize, Deserialize, Debug, IRNode)]
struct TypeNode {
    secret: bool,
    type_: String
}
#[derive(Debug, IRNode)]
struct FunctionDefinition {
    name: NameExpr,
    parameters: Vec<Box<dyn IRNode>>,
    body: Vec<Box<dyn IRNode>>,
    return_type: TypeNode,
}
#[derive(Debug, IRNode)]
struct ReturnStatement {
    expression: Box<dyn IRNode>,
}
#[derive(Debug, IRNode)]
struct VariableDefinition {
    name: NameExpr,
    type_: TypeNode,
}
#[derive(Debug, IRNode)]
struct ForEach {
    iterator: VariableDefinition,
    range: RangeExpr,
    body: Vec<Box<dyn IRNode>>,
}
#[derive(Debug, IRNode)]
struct ForStatement {
    initial: Box<dyn IRNode>,
    condition: Box<dyn IRNode>,
    increment: Box<dyn IRNode>,
    body: Vec<Box<dyn IRNode>>,
}
/// Expr Definitions
#[derive(Debug, IRNode)]
struct VariableAssignment {
    name: NameExpr,
    expression: Box<dyn IRNode>,
}
#[derive(Debug, IRNode)]
struct IfExpr {
    condition: Box<dyn IRNode>,
    ifBody: Vec<Box<dyn IRNode>>,
    elseBody: Vec<Box<dyn IRNode>>,
}
#[derive(Debug, IRNode)]
struct OblivIf {
    condition: Box<dyn IRNode>,
    ifBody: Vec<Box<dyn IRNode>>,
    elseBody: Vec<Box<dyn IRNode>>,
}
#[derive(Debug, IRNode)]
enum Value {
    bool,
    String,
    i64,
}
#[derive(Debug, IRNode)]
struct literalExpr {
    value: Value,
}

#[derive(Debug, IRNode)]
struct NameExpr {
    name: String,
}
#[derive(Debug, IRNode)]
struct directExpr {
    operator: String,
    arity: i64,
    operands: Vec<Box<dyn IRNode>>,
}
#[derive(Debug, IRNode)]
struct parentheticalExpr {
    expression: dyn IRNode,
}
#[derive(Debug, IRNode)]
struct ArrayAccess {
    array: Box<dyn IRNode>,
    index: dyn IRNode,
}
#[derive(Debug, IRNode)]
struct RangeExpr {
    start: Box<dyn IRNode>,
    end: Box<dyn IRNode>,
    increment: Option<Box<dyn IRNode>>,
}
#[derive(Debug, IRNode)]
struct SliceExpr {
    array: Box<dyn IRNode>,
    index: RangeExpr,
}
#[derive(Debug, IRNode)]
struct FunctionCall {
    function: Box<dyn IRNode>,
    parameters: Vec<Box<dyn IRNode>>,
}

fn main() {
    let type_node = TypeNode { secret: false, type_: "Test Type".to_string()};
    let name = NameExpr {name: String::from("new expr")};
    let serialized = serde_json::to_string(&type_node).unwrap();
    println!("serialized = {:?} ", serialized);
    println!("node type = {}", type_node.node_type());
    println!("node type = {}", name.node_type());
}
