use syn::visit::{Visit};
use crate::ir::{NameExpression};

impl NameExpression {
    pub fn new_(name: &str) -> NameExpression {
        let mut nameexpr = NameExpression::new(String::from(name));
        return nameexpr;
    }
}
