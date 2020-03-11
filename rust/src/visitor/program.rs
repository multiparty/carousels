use syn::visit::{Visit};
use syn::{Item};
use crate::ir::{Program, FunctionDefinition, NameExpression, TypeNode};


impl <'ast> Visit <'ast> for Program{
    fn visit_item(&mut self, node: &'ast Item){
        match node{
            Item::Fn(_f)=>{
                let name = NameExpression::new(String::from(""));
                let ty = TypeNode::new(false, String::from(""), String::from(""));
                let mut func = FunctionDefinition::new(name, Vec::new(), Vec::new(), ty);

                func.visit_item_fn(_f);

                self.body.push(Box::new(func));
            }
            _=>{}
        }
    }
}
