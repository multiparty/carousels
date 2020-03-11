use syn::visit::{Visit};
use syn::{Expr};
use ir_node_derive::ir_node;
use crate::ir::{IRNode, DirectExpression, Error};

pub struct Stack{
    pub visitor: Vec<Box<dyn IRNode>>
}

impl Stack{
    pub fn my_visit_expr<'ast>(node: &'ast Expr) -> Box<dyn IRNode>{

        let mut stack = Stack{visitor: Vec::new()};
        stack.visit_expr(node);

        match stack.visitor.pop(){
            Some(_s)=>{
                return _s;
            }
            None =>{
                return Box::new(Error::new(
                    String::from("Error poping from visit_expr_stack")));
            }
        }

    }
}

impl <'ast> Visit <'ast> for Stack{

    fn visit_expr(&mut self, node: &'ast Expr){

    }

}
