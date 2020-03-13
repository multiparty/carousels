use syn::visit::{Visit};
use syn::{Item};
use crate::ir::{IRNode, FunctionDefinition, NameExpression, TypeNode};
use serde::ser::{Serialize, Serializer, SerializeSeq};

pub struct Program {
    pub body: Vec<Box<dyn IRNode>>
}

impl Serialize for Program {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer, {
        let mut seq = serializer.serialize_seq(Some(self.body.len()))?;
        for e in &self.body {
            seq.serialize_element(&*e)?;
        }
        seq.end()
    }
}


impl <'ast> Visit <'ast> for Program {
    fn visit_item(&mut self, node: &'ast Item){
        match node{
            Item::Fn(_f)=>{
                let name = NameExpression::new(String::from(""));
                let ty = TypeNode::new(false, String::from(""),  None);
                let mut func = FunctionDefinition::new(name, Vec::new(), Vec::new(), ty);

                func.visit_item_fn(_f);

                self.body.push(Box::new(func));
            }
            _=>{}
        }
    }
}
