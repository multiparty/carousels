use syn::{Type, Path, PathArguments, GenericArgument, TypeParamBound};
use crate::ir::{TypeNode};

static NUMERICTYPES: [&str; 8] = ["u8","u16","u32","u128","u128","u128","i32","i128"];

impl TypeNode {
    pub fn my_visit_type<'ast>(&mut self, node: &'ast Type){
        match node{
            Type::Array(_a)=>{
                let mut ty = TypeNode::new(false, String::from(""),None);
                ty.my_visit_type(&_a.elem);

                self.type_ = String::from("array");
                self.dependent_type = Some(Box::new(ty));
            }
            Type::Path(_p)=>{
                self.my_visit_path(&_p.path);
            }
            Type::Ptr(_ptr)=>{
                self.my_visit_type(&_ptr.elem);
            }
            Type::Reference(_r)=>{
                self.my_visit_type(&_r.elem);
            }
            Type::Slice(_s)=>{
                let mut ty = TypeNode::new(false, String::from(""),None);
                ty.my_visit_type(&_s.elem);

                self.type_ = String::from("array");
                self.dependent_type = Some(Box::new(ty));
            }
            _=>{}
        }
    }
    fn my_visit_path<'ast>(&mut self, node: &'ast Path){

        for ps in node.segments.iter(){

            let ident = ps.ident.to_string();

            if &ident == "Possession" {
                self.secret = true;
            }

            if self.type_.is_empty(){
                if &ident == "Vec"{
                    self.type_ = "array".to_string();
                }
                else if &ident == "Vector"{
                    self.type_ = "vector".to_string();
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
                        let mut ty = TypeNode::new(false, String::from(""),None);
                        let a = &_a.args.first();
                        match a{
                            Some(arg) => {
                                match arg{
                                    GenericArgument::Type(_t)=>{
                                        ty.my_visit_type(_t);
                                    }
                                    GenericArgument::Binding(_b)=>{

                                        if _b.ident == "Possession" {
                                            self.secret = true;
                                        }
                                        ty.my_visit_type(&_b.ty);
                                    }
                                    GenericArgument::Constraint(_c)=>{
                                        if &_c.ident == "Possession" {
                                            self.secret = true;
                                        }
                                        let b = _c.bounds.first();
                                        match b{
                                            Some(b_)=>{
                                                match b_{
                                                    TypeParamBound::Trait(_tr)=>{
                                                        ty.my_visit_path(&_tr.path);
                                                    }
                                                    _=>{}
                                                }
                                            }
                                            None =>{}
                                        }
                                    }
                                    _=>{}
                                }
                                if ps.ident == "Possession" {
                                    self.type_ = ty.type_;
                                }else{
                                    self.dependent_type = Some(Box::new(ty));
                                }
                            }
                            None =>{}
                        }
                    }
                _=>{}
            }
        }
    }
}
