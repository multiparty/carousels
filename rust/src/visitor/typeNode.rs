use syn::visit::{Visit};
use syn::{Type, Path, PathArguments, ReturnType, GenericArgument, TypeParamBound};
use crate::ir::{TypeNode};

static NUMERICTYPES: [&str; 8] = ["u8","u16","u32","u128","u128","u128","i32","i128"];

impl TypeNode {
    pub fn new_(type_: &str, dependentType: &str) -> TypeNode {
        let mut ty = TypeNode::new(false, String::from(type_),String::from(dependentType));
        return ty;
    }
}

impl <'ast> Visit <'ast> for TypeNode {
    fn visit_type(&mut self, node: &'ast Type){
        // println!("{}", format!("{:#?}", &node));
        match node{
            Type::Array(_a)=>{
                 self.dependentType.push_str("[");
                 self.type_ = "array".to_string();
                 self.visit_type(&_a.elem);
                 self.dependentType.push_str("]");
            }
            Type::Path(_p)=>{
                self.visit_path(&_p.path);
            }
            Type::Ptr(_ptr)=>{
                self.dependentType.push_str("*");
                self.visit_type(&_ptr.elem);
            }
            Type::Reference(_r)=>{
                self.dependentType.push_str("&");
                self.visit_type(&_r.elem);
            }
            Type::Slice(_s)=>{
                self.dependentType.push_str("[");
                self.type_ = String::from("array");
                self.visit_type(&_s.elem);
                self.dependentType.push_str("]");
            }
            Type::Verbatim(_v)=>{
                self.dependentType.push_str(&_v.to_string());
            }
            _=>{}
        }
    }
    fn visit_path(&mut self, node: &'ast Path){
        if self.node_type != "TypeNode".to_string() {
            println!("{}", "Path not implemented for this node_type");
            return ;
        }
        match &node.leading_colon{
            Some(c)=>{self.dependentType.push_str("::")}
            None=>{}
        }

        for ps in node.segments.iter(){

            let ident = ps.ident.to_string();
            self.dependentType.push_str(&ident);

            if &ident == "Possession" {
                self.secret = true;
            }

            if self.type_.is_empty(){
                if &ident == "Vec" {
                    self.type_ = "array".to_string();
                }
                else if &ident == "bool"  || &ident == "str" || &ident == "char"  {
                    self.type_ = ident;
                }
                else{
                    for n in &NUMERICTYPES {
                        if &ident == n{
                            self.type_ = String::from("number");
                        }
                    }
                }
            }

            match &ps.arguments{
                PathArguments::AngleBracketed(_a)=>{
                    self.dependentType.push_str("<");

                    for _arg in _a.args.iter(){
                        match _arg {
                            GenericArgument::Type(_t)=>{
                                self.visit_type(_t);
                            }
                            GenericArgument::Binding(_b)=>{

                                if &_b.ident == "Possession" {
                                    self.secret = true;
                                }
                                self.visit_type(&_b.ty);
                            }
                            GenericArgument::Constraint(_c)=>{
                                if &_c.ident == "Possession" {
                                    self.secret = true;
                                }
                                for b in _c.bounds.iter(){
                                    match b{
                                        TypeParamBound::Trait(_tr)=>{
                                            self.visit_path(&_tr.path);
                                        }
                                        _=>{}
                                    }
                                }
                            }
                            _=>{}
                        }
                        self.dependentType.push_str(",");
                    }
                    self.dependentType.pop();
                    self.dependentType.push_str(">");
                }
                PathArguments::Parenthesized(_p)=>{
                     self.dependentType.push_str("(");
                    for inp in _p.inputs.iter(){
                        self.visit_type(inp);
                        self.dependentType.push_str(",");
                    }
                    self.dependentType.pop();
                    self.dependentType.push_str(")");

                    match &_p.output{
                        ReturnType::Type(_, _t)=>{
                            self.dependentType.push_str("->");
                            self.visit_type(_t);
                        }
                        _=>{}
                    }
                }
                _=>{}
            }
        }
    }
}
