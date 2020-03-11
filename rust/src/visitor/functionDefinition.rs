use syn::visit::{Visit};
use syn::{ItemFn, FnArg, ReturnType, Stmt};
use crate::ir::{IRNode, FunctionDefinition, NameExpression, TypeNode, VariableDefinition, VariableAssignment};

impl <'ast> Visit <'ast> for FunctionDefinition{

    fn visit_item_fn(&mut self, node: &'ast ItemFn){

        self.name.name = node.sig.ident.to_string();

        for inp in &node.sig.inputs{
            let mut param = VariableDefinition::new(NameExpression::new_(""), TypeNode::new_("", ""), None);

            match inp{
                FnArg::Receiver(_r)=>{
                    param.name.name = String::from("self");
                }
                FnArg::Typed(_t)=>{
                    param.visit_pat(&_t.pat);
                    param.type_.visit_type(&_t.ty);
                }
            }
            self.parameters.push(param);
        }

        match &node.sig.output{
            ReturnType::Type(_ , _t)=>{
                self.return_type.visit_type(_t);
            }
            _=>{}
        }

        for s in &node.block.stmts {
            self.visit_stmt(s); // call visit_stmt on each statement in the fn body
        }
    }
        fn visit_stmt(&mut self, node: &'ast Stmt){
            match node{
                Stmt::Item(_i)=>{

                }
                Stmt::Local(_l)=>{

                }
                Stmt::Expr(_e)=>{

                }
                Stmt::Semi(_e, _s)=>{

                }
            }
        }
}
