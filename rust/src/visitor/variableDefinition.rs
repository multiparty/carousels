use syn::visit::{Visit};
use syn::{Local, Pat};
use crate::ir::{IRNode, VariableDefinition, VariableAssignment, NameExpression, TypeNode};
use crate::visitor::stack::{Stack};

impl <'ast> Visit <'ast> for VariableDefinition{
    fn visit_pat(&mut self, node: &'ast Pat){

    }
    fn visit_local(&mut self, node: &'ast Local){

        match &node.pat{
            Pat::Ident(_p)=>{
                self.name.visit_ident(&_p.ident);
            }
            Pat::Type(_t)=>{
                self.name.visit_pat(&_t.pat);
                self.type_.visit_type(&_t.ty);
            }
            _=>{}
        }

        match &node.init{
            Some(_e)=>{
                let mut name_a = NameExpression::new(self.name.name.clone());
                let mut expression = Stack::my_visit_expr(&_e.1);
                self.assignment = Some(VariableAssignment::new(name_a, expression));
            }
            None =>{}
        }
    }
}
