use syn::visit::{Visit};
use syn::{ItemFn, FnArg, ReturnType};
use crate::ir::{FunctionDefinition, NameExpression, TypeNode, VariableDefinition};

impl <'ast> Visit <'ast> for FunctionDefinition{

    fn visit_item_fn(&mut self, node: &'ast ItemFn){

        self.name.name = node.sig.ident.to_string();

        for inp in &node.sig.inputs{

            let mut name = NameExpression::new("".to_string());
            let mut ty = TypeNode::new(false, "".to_string());
            let mut param = VariableDefinition::new(name, ty);

            match inp{
                FnArg::Receiver(_r)=>{
                    param.name.name = "self".to_string();
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
    }
}
