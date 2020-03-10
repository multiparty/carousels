use syn::visit::{Visit};
use syn::{Pat};
use crate::ir::{VariableDefinition, NameExpression, TypeNode};

impl <'ast> Visit <'ast> for VariableDefinition{
    fn visit_pat(&mut self, node: &'ast Pat){

    }
}
