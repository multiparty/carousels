// Now the real code
// TODO: organize into files
//use ir_node_derive::ir_node;

// Abstract trait
//#[typetag::serde(tag = "type")]
pub trait IRNode: std::fmt::Debug { }

//#[ir_node]
#[derive(serde::Serialize, serde::Deserialize, Debug, Default)]
pub struct Node{
    #[serde(skip_serializing_if = "String::is_empty")]
    pub name: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub nameNode: Vec<Node>,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub value: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub type_: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub typeNode: Vec<Node>,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub dependentType_: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub nodeType: String,
    pub secret: bool,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub arity: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub operator: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub returnType: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub function: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub parameters: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub array: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub ifBody: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub elseBody: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub left: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub right: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub expression: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub condition: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub body: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub elements: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub operands: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub range: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub index: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub iterator: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub increment: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub repeat: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub length: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub initial: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub start: Vec<Node>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub end: Vec<Node>,
}
