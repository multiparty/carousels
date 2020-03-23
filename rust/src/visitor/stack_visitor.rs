use syn::visit::{Visit};
use syn::{Expr, Stmt, Pat};
use crate::visitor::stack::{Stack};

use crate::ir::{TypeNode, VariableDefinition, NameExpression, RangeExpression};

impl Stack{
    pub fn visit_stmt<'ast>(&mut self, node: &'ast Stmt){
        match node{
            Stmt::Local(_l)=>{
                let name = NameExpression::new(String::from(""));
                let ty = TypeNode::new(false, String::from(""), None);
                let mut variable_def = VariableDefinition::new(name,ty,None);

                variable_def.visit_local(_l);
                self.visitor.push(Box::new(variable_def));
            }
            Stmt::Expr(_e)=>{
                let expression = Stack::my_visit_expr(&_e);
                self.visitor.push(expression);
            }
            Stmt::Semi(_e, _s)=>{
                let expression = Stack::my_visit_expr(&_e);
                self.visitor.push(expression);
            }
            _=>{}
        }
    }

    pub fn visit_expr<'ast>(&mut self, node: &'ast Expr){
        match node {
            Expr::Array(_e)=>{
                self.visit_expr_array(_e);
            }
            Expr::Call(_e)=>{
                self.visit_expr_call(_e);
            }
            Expr::MethodCall(_e)=>{
                self.visit_expr_method_call(_e);
            }
            Expr::Tuple(_e)=>{
                self.visit_expr_tuple(_e);
            }
            Expr::Binary(_e)=>{
                self.visit_expr_binary(_e);
            }
            Expr::Unary(_e)=>{
                self.visit_expr_unary(_e);
            }
            Expr::Lit(_e)=>{
                self.visit_expr_lit(_e);
            }
            Expr::If(_e)=>{
                self.visit_expr_if(_e);
            }
            Expr::Assign(_e)=>{
                self.visit_expr_assign(_e);
            }
            Expr::Field(_e)=>{
                self.visit_expr_field(_e);
            }
            Expr::Index(_e)=>{
                self.visit_expr_index(_e);
            }
            Expr::Range(_e)=>{
                self.visit_expr_range(_e);
            }
            Expr::ForLoop(_e)=>{
                self.visit_expr_for_loop(_e);
            }
            Expr::Paren(_e)=>{
                self.visit_expr_paren(_e);
            }
            Expr::Block(_b)=>{
                self.visit_expr_block(_b);
            }
            Expr::Return(_e)=>{
                self.visit_expr_return(_e);
            }
            Expr::Path(_e)=>{
                self.visit_expr_path(_e);
            }
            Expr::Macro(_m)=>{
                self.visit_expr_macro(_m);
            }
            Expr::Reference(_r)=>{
                self.visit_expr(&_r.expr);
            }
            _=>{}
        }

    }
    pub fn visit_pat<'ast>(&mut self, node: &'ast Pat){
        match node{
            Pat::Ident(_i)=>{
                let name = NameExpression::new(_i.ident.to_string());
                self.visitor.push(Box::new(name));
            }
            Pat::Lit(_l)=>{
                self.visit_expr(&_l.expr);
            }
            Pat::Range(_r)=>{
                let from = Stack::my_visit_expr(&_r.lo);
                let to = Stack::my_visit_expr(&_r.hi);
                let range = RangeExpression::new(Some(from), Some(to), None);
                self.visitor.push(Box::new(range));
            }
            Pat::Wild(_w)=>{
                let wild = NameExpression::new(String::from("_"));
                self.visitor.push(Box::new(wild));
            }
            _=>{}
        }

    }
}
