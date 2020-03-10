use syn::visit::{Visit};
use syn::{Type};
use crate::ir::{TypeNode};

impl <'ast> Visit <'ast> for TypeNode{
    fn visit_type(&mut self, node: &'ast Type){

    }
}
