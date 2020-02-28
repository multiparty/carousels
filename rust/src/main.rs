use serde::{Serialize, Deserialize};
use std::fmt::Debug;
use ir_node_derive::IRNode;

#[allow(non_snake_case)]

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
struct FunctionDefinition {
    name: NameExpr,
    parameters: Vec<Box<dyn IRNode>>,
    body: Vec<Box<dyn IRNode>>,
    return_type: TypeNode,
}
struct ReturnStatement {
    expression: Box<dyn IRNode>,
}
struct VariableDefinition {
    name: NameExpr,
    type_: TypeNode,
}
struct ForEach {
    iterator: VariableDefinition,
    range: RangeExpr,
    body: Vec<Box<dyn IRNode>>,
}
struct ForStatement {
    initial: Box<dyn IRNode>,
    condition: Box<dyn IRNode>,
    increment: Box<dyn IRNode>,
    body: Vec<Box<dyn IRNode>>,
}
/// Expr Definitions
struct VariableAssignment {
    name: NameExpr,
    expression: Box<dyn IRNode>,
}
struct IfExpr {
    condition: Box<dyn IRNode>,
    ifBody: Vec<Box<dyn IRNode>>,
    elseBody: Vec<Box<dyn IRNode>>,
}
struct OblivIf {
    condition: Box<dyn IRNode>,
    ifBody: Vec<Box<dyn IRNode>>,
    elseBody: Vec<Box<dyn IRNode>>,
}
enum Value {
    bool,
    String,
    i64,
}
struct literalExpr {
    value: Value,
}

struct NameExpr {
    name: String,
}
struct directExpr {
    operator: String,
    arity: i64,
    operands: Vec<Box<dyn IRNode>>,
}
struct parentheticalExpr {
    expression: dyn IRNode,
}
struct ArrayAccess {
    array: Box<dyn IRNode>,
    index: dyn IRNode,
}
struct RangeExpr {
    start: Box<dyn IRNode>,
    end: Box<dyn IRNode>,
    increment: Option<Box<dyn IRNode>>,
}
struct SliceExpr {
    array: Box<dyn IRNode>,
    index: RangeExpr,
}
struct FunctionCall {
    function: Box<dyn IRNode>,
    parameters: Vec<Box<dyn IRNode>>,
}

fn main() {
    let type_node = TypeNode { secret: false, type_: "Test Type".to_string()};
    let serialized = serde_json::to_string(&type_node).unwrap();
    println!("serialized = {:?} ", serialized);
    println!("node type = {}", type_node.node_type());
}
