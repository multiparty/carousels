use syn::{Expr, Stmt, Pat, Item};
use crate::ir::{IRNode, Error};

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
                    format!("Error popping from visit_expr_stack: {:?}", node)));
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
                    format!("Error popping from visit_stmt_stack: {:?}", node)));
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
                    format!("Error popping from visit_pat_stack: {:?}", node)));
            }
        }
    }

    pub fn my_visit_item<'ast>(node: &'ast Item) -> Box<dyn IRNode>{

        let mut stack = Stack{visitor: Vec::new()};
        stack.visit_item(node);
        match stack.visitor.pop(){
            Some(_s)=>{
                return _s;
            }
            None =>{
                return Box::new(Error::new(
                    format!("Error popping from visit_item_stack: {:?}", node)));
            }
        }
    }

}
