use syn::visit::{Visit};
use syn::{Ident, Pat, ExprPath};
use crate::ir::{NameExpression};

impl <'ast> Visit <'ast> for NameExpression{
    fn visit_ident(&mut self, node: &'ast Ident){
        self.name = node.to_string();
    }
}
