use syn::visit::{Visit};
use syn::{Type, Path, PathArguments, ReturnType, GenericArgument, TypeParamBound};
use crate::ir::{TypeNode};

static NUMERICTYPES: [&str; 8] = ["u8","u16","u32","u128","u128","u128","i32","i128"];

impl TypeNode {
    pub fn new_(type_: &str, dependent_type: &str) -> TypeNode {
        let ty = TypeNode::new(false, String::from(type_),String::from(dependent_type));
        return ty;
    }
}

impl <'ast> Visit <'ast> for TypeNode {
    fn visit_type(&mut self, node: &'ast Type){
        // println!("{}", format!("{:#?}", &node));
        match node{
            Type::Array(_a)=>{
                 self.dependent_type.push_str("[");
                 self.type_ = "array".to_string();
                 self.visit_type(&_a.elem);
                 self.dependent_type.push_str("]");
            }
            Type::Path(_p)=>{
                self.visit_path(&_p.path);
            }
            Type::Ptr(_ptr)=>{
                self.dependent_type.push_str("*");
                self.visit_type(&_ptr.elem);
            }
            Type::Reference(_r)=>{
                self.dependent_type.push_str("&");
                self.visit_type(&_r.elem);
            }
            Type::Slice(_s)=>{
                self.dependent_type.push_str("[");
                self.type_ = String::from("array");
                self.visit_type(&_s.elem);
                self.dependent_type.push_str("]");
            }
            Type::Verbatim(_v)=>{
                self.dependent_type.push_str(&_v.to_string());
            }
            _=>{}
        }
    }
    fn visit_path(&mut self, node: &'ast Path){
        
        match &node.leading_colon{
            Some(c)=>{self.dependent_type.push_str("::")}
            None=>{}
        }

        for ps in node.segments.iter(){

            let ident = ps.ident.to_string();
            self.dependent_type.push_str(&ident);

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
                    self.dependent_type.push_str("<");

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
                        self.dependent_type.push_str(",");
                    }
                    self.dependent_type.pop();
                    self.dependent_type.push_str(">");
                }
                PathArguments::Parenthesized(_p)=>{
                     self.dependent_type.push_str("(");
                    for inp in _p.inputs.iter(){
                        self.visit_type(inp);
                        self.dependent_type.push_str(",");
                    }
                    self.dependent_type.pop();
                    self.dependent_type.push_str(")");

                    match &_p.output{
                        ReturnType::Type(_, _t)=>{
                            self.dependent_type.push_str("->");
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
