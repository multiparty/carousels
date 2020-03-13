use syn::visit::{Visit};
use syn::{ItemFn, FnArg, ReturnType};
use crate::ir::{FunctionDefinition, NameExpression, TypeNode, VariableDefinition};
use crate::visitor::stack::{Stack};

impl <'ast> Visit <'ast> for FunctionDefinition{

    fn visit_item_fn(&mut self, node: &'ast ItemFn){

        self.name.name = node.sig.ident.to_string();

        for inp in &node.sig.inputs{
            let mut name = NameExpression::new(String::from(""));

            let mut dep_type = String::from("");
            let mut ty = TypeNode::new(false, String::from(""),None);

            match inp{
                FnArg::Receiver(_r)=>{
                    name.name = String::from("self");
                }
                FnArg::Typed(_t)=>{
                    name.visit_pat(&_t.pat);
                    ty.my_visit_type(&_t.ty, &mut dep_type);
                    ty.dependent_type = Some(Box::new(TypeNode::new(ty.secret, dep_type, None)));
                }
            }
                self.parameters.push(Box::new(VariableDefinition::new(name, ty, None)));
            }

            match &node.sig.output {
                ReturnType::Type(_ , _t)=>{
                    let mut dep_type = String::from("");
                    self.return_type.my_visit_type(_t, &mut dep_type);
                    self.return_type.dependent_type = Some(Box::new(TypeNode::new(self.return_type.secret, dep_type, None)));
                }
                _=>{}
            }

            for s in &node.block.stmts {
                self.body.push(Stack::my_visit_stmts(s)); // call visit_stmt on each statement in the fn body
            }
    }
}
