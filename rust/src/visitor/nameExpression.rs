use syn::visit::{Visit};
use syn::{Ident};
use crate::ir::{NameExpression};

impl NameExpression {
    pub fn new_(name: &str) -> NameExpression {
        let mut nameexpr = NameExpression::new(String::from(name));
        return nameexpr;
    }
}
impl <'ast> Visit <'ast> for NameExpression{
    fn visit_ident(&mut self, node: &'ast Ident){

    }
}
