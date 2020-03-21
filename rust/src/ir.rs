use ir_node_derive::ir_node;

// Abstract trait
#[typetag::serde(tag = "serializationTag")]
pub trait IRNode: std::fmt::Debug {
}

#[ir_node]
struct Error {
    err: String
}

// Logical nodes
#[ir_node]
struct TypeNode {
    secret: bool,
    type_: String,
    dependent_type: Option<Box<TypeNode>>
}

// Statements
#[ir_node]
struct FunctionDefinition {
    name: NameExpression,
    parameters: Vec<Box<dyn IRNode>>,
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
    type_: TypeNode,
    assignment: Option<VariableAssignment>
}
#[ir_node]
struct ForEach {
    iterator: Box<dyn IRNode>,
    range: Box<dyn IRNode>,
    body: Vec<Box<dyn IRNode>>
}
#[ir_node]
struct For {
    initial: Vec<Box<dyn IRNode>>,
    condition: Box<dyn IRNode>,
    increment: Vec<Box<dyn IRNode>>,
    body: Vec<Box<dyn IRNode>>,
}

// Expressions
#[ir_node]
struct VariableAssignment {
    name: Box<dyn IRNode>,
    expression: Box<dyn IRNode>
}

#[ir_node]
struct If {
    condition: Box<dyn IRNode>,
    if_body: Vec<Box<dyn IRNode>>,
    else_body: Option<Vec<Box<dyn IRNode>>>
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
    pub name: String
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
    start: Option<Box<dyn IRNode>>,
    end: Option<Box<dyn IRNode>>,
    increment: Option<Box<dyn IRNode>>
}

#[ir_node]
struct SliceExpression {
    array: Box<dyn IRNode>,
    range: Box<dyn IRNode>
}

#[ir_node]
struct ArrayExpression {
    elements: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct FunctionCall{
    function: Box<dyn IRNode>, // either NameExpression or DotExpression
    parameters: Vec<Box<dyn IRNode>>
}

#[ir_node]
struct DotExpression {
    left: Box<dyn IRNode>,
    right: Box<dyn IRNode>
}
