use syn::visit::{Visit};
use syn::{Expr, Stmt, Pat};
use ir_node_derive::ir_node;
use crate::ir::{IRNode, TypeNode, VariableDefinition, NameExpression, Error};

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

    pub fn my_visit_stmts<'ast>(node: &'ast Stmt) -> Box<dyn IRNode>{
        let mut stack = Stack{visitor: Vec::new()};
        stack.visit_stmt(node);
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

    pub fn my_visit_pat<'ast>(node: &'ast Pat) -> Box<dyn IRNode>{
        let mut stack = Stack{visitor: Vec::new()};
        stack.visit_pat(node);
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
