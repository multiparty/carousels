use syn::{Type, Path, PathArguments, ReturnType, GenericArgument, TypeParamBound};
use crate::ir::{TypeNode};

static NUMERICTYPES: [&str; 8] = ["u8","u16","u32","u128","u128","u128","i32","i128"];

impl TypeNode {
    pub fn my_visit_type<'ast>(&mut self, node: &'ast Type, dependent_type: &mut String){
        // println!("{}", format!("{:#?}", &node));
        match node{
            Type::Array(_a)=>{
                 dependent_type.push_str("[");
                 self.type_ = "array".to_string();
                 self.my_visit_type(&_a.elem, dependent_type);
                 dependent_type.push_str("]");
            }
            Type::Path(_p)=>{
                self.my_visit_path(&_p.path, dependent_type);
            }
            Type::Ptr(_ptr)=>{
                dependent_type.push_str("*");
                self.my_visit_type(&_ptr.elem, dependent_type);
            }
            Type::Reference(_r)=>{
                dependent_type.push_str("&");
                self.my_visit_type(&_r.elem, dependent_type);
            }
            Type::Slice(_s)=>{
                dependent_type.push_str("[");
                self.type_ = String::from("array");
                self.my_visit_type(&_s.elem, dependent_type);
                dependent_type.push_str("]");
            }
            Type::Verbatim(_v)=>{
                dependent_type.push_str(&_v.to_string());
            }
            _=>{}
        }
    }
    fn my_visit_path<'ast>(&mut self, node: &'ast Path, dependent_type: &mut String){

        match &node.leading_colon{
            Some(_c)=>{dependent_type.push_str("::")}
            None=>{}
        }

        for ps in node.segments.iter(){

            let ident = ps.ident.to_string();
            dependent_type.push_str(&ident);

            if &ident == "Possession" {
                self.secret = true;
            }

            if self.type_.is_empty(){
                if &ident == "Vec" || &ident == "Vector"{
                    self.type_ = "array".to_string();
                }
                else if &ident == "bool"  || &ident == "str" || &ident == "char" || &ident == "Matrix"{
                    self.type_ = ident;
                }
                else if &ident == "f64" || &ident == "f32"{
                    self.type_ = String::from("float");
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
                    dependent_type.push_str("<");

                    for _arg in _a.args.iter(){
                        match _arg {
                            GenericArgument::Type(_t)=>{
                                self.my_visit_type(_t, dependent_type);
                            }
                            GenericArgument::Binding(_b)=>{

                                if &_b.ident == "Possession" {
                                    self.secret = true;
                                }
                                self.my_visit_type(&_b.ty, dependent_type);
                            }
                            GenericArgument::Constraint(_c)=>{
                                if &_c.ident == "Possession" {
                                    self.secret = true;
                                }
                                for b in _c.bounds.iter(){
                                    match b{
                                        TypeParamBound::Trait(_tr)=>{
                                            self.my_visit_path(&_tr.path, dependent_type);
                                        }
                                        _=>{}
                                    }
                                }
                            }
                            _=>{}
                        }
                        dependent_type.push_str(",");
                    }
                    dependent_type.pop();
                    dependent_type.push_str(">");
                }
                PathArguments::Parenthesized(_p)=>{
                     dependent_type.push_str("(");
                    for inp in _p.inputs.iter(){
                        self.my_visit_type(inp, dependent_type);
                        dependent_type.push_str(",");
                    }
                    dependent_type.pop();
                    dependent_type.push_str(")");

                    match &_p.output{
                        ReturnType::Type(_, _t)=>{
                            dependent_type.push_str("->");
                            self.my_visit_type(_t, dependent_type);
                        }
                        _=>{}
                    }
                }
                _=>{}
            }
        }
    }
}
