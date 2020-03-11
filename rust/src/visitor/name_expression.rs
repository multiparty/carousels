use syn::visit::{Visit};
use syn::{Ident, Pat, ExprPath};
use crate::ir::{NameExpression};

impl <'ast> Visit <'ast> for NameExpression{
    fn visit_ident(&mut self, node: &'ast Ident){
        self.name = node.to_string();
    }
    fn visit_expr_path(&mut self, node: &'ast ExprPath){
        for seg in &node.path.segments{
            self.name.push_str(&seg.ident.to_string());
            self.name.push_str("::");
        }
        self.name.pop();
    }
}
