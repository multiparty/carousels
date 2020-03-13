use syn::visit::{Visit};
use syn::{Local, Pat};
use crate::ir::{IRNode, VariableDefinition, VariableAssignment, NameExpression, TypeNode};
use crate::visitor::stack::{Stack};

impl <'ast> Visit <'ast> for VariableDefinition{
    fn visit_local(&mut self, node: &'ast Local){
        let mut name = NameExpression::new(String::from(""));
        let mut ty = TypeNode::new(false, String::from(""),String::from(""));
        match &node.pat{
            Pat::Ident(_p)=>{
                name.visit_ident(&_p.ident);
            }
            Pat::Type(_t)=>{
                name.visit_pat(&_t.pat);
                ty.visit_type(&_t.ty);
            }
            _=>{}
        }

        self.name = name;
        self.type_ = ty;

        match &node.init{
            Some(_e)=>{
                let name_a = NameExpression::new(self.name.name.clone());
                let expression = Stack::my_visit_expr(&_e.1);
                self.assignment = Some(VariableAssignment::new(Box::new(name_a), expression));
            }
            None =>{}
        }
    }
}
