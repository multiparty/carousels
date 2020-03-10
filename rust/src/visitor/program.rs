use syn::visit::{Visit};
use syn::{Item};
use crate::ir::{Program, FunctionDefinition, NameExpression, TypeNode};


impl <'ast> Visit <'ast> for Program{
    fn visit_item(&mut self, node: &'ast Item){
        match node{
            Item::Fn(_f)=>{
                let mut name = NameExpression::new("".to_string());
                let mut ty = TypeNode::new(false, "".to_string());
                let mut func = FunctionDefinition::new(name, Vec::new(), Vec::new(), ty);
                func.visit_item_fn(_f);
                self.body.push(Box::new(func));
            }
            _=>{}
        }
    }
}
