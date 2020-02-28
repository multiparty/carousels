use ir_node_derive::ir_node;

// Abstract trait
#[typetag::serde(tag = "type")]
trait IRNode: std::fmt::Debug { }

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
    body: Vec<Box<dyn IRNode>>
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
    name: String
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

fn main() {
    let type_expression = TypeNode::new(false, "Test Type".to_string());
    let name_expression = NameExpression::new("f1".to_string());
    let function_def = FunctionDefinition::new(name_expression, Vec::new(), Vec::new(), type_expression);

    println!("{}", serde_json::to_string(&function_def).unwrap());
}
