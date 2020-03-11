use syn::visit::{Visit};
use syn::{ItemFn, FnArg, ReturnType, Stmt};
use crate::ir::{IRNode, FunctionDefinition, NameExpression, TypeNode, VariableDefinition, VariableAssignment};
use crate::visitor::stack::{Stack};

impl <'ast> Visit <'ast> for FunctionDefinition{

    fn visit_item_fn(&mut self, node: &'ast ItemFn){

        self.name.name = node.sig.ident.to_string();

        for inp in &node.sig.inputs{
            let mut name = NameExpression::new(String::from(""));
            let mut ty = TypeNode::new(false, String::from(""), String::from(""));

            match inp{
                FnArg::Receiver(_r)=>{
                    name.name = String::from("self");
                }
                FnArg::Typed(_t)=>{
                    name.visit_pat(&_t.pat);
                    ty.visit_type(&_t.ty);
                }
            }
            self.parameters.push(Box::new(VariableDefinition::new(name, ty, None)));
        }

        match &node.sig.output{
            ReturnType::Type(_ , _t)=>{
                self.return_type.visit_type(_t);
            }
            _=>{}
        }

        for s in &node.block.stmts {
            self.body.push(Stack::my_visit_stmts(s)); // call visit_stmt on each statement in the fn body
        }
    }
}
