use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, Lit, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary,
    ExprArray, ExprIndex, PatIdent, Member};

fn main() {
    let src = "
            fn main() {
            let x = 5 + 2;
            let mut array: [i32; 3] = [0; 3];
            let mut array2: [i32; 3] = [0, 0 ,0];
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();
    let mut visitor = FnVisitor { ir: Vec::new() };
    visitor.visit_file(&syntax);
    for lit in visitor.ir.iter() {
        println!("{}", lit);
    }
}

struct FnVisitor {
    ir: Vec<String>,

}

impl<'ast> Visit<'ast> for FnVisitor {
    fn visit_item_fn(&mut self, node: &'ast ItemFn){
        let fn_name = &node.ident;
        let fn_body = &node.block.stmts;
        self.ir.push(format!("{:#?}", fn_name));

        for stmt in fn_body {
            self.visit_stmt(stmt);
        }
    }
    fn visit_expr_call(&mut self, node: &'ast ExprCall){
    }
    fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
    }
    fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

    }
    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
        let left = &node.left;
        let right = &node.right;
        let op = &node.op;
        self.visit_expr(&*node.left);
        self.visit_bin_op(&node.op);
        self.visit_expr(&*node.right);
      }
     fn visit_lit(&mut self, node: &'ast Lit){
         match node{
            Lit::Str(_s) => {
                let value = _s.value();
            }
            Lit::ByteStr (_bs) => {
                let value = _bs.value();
            }
            Lit::Byte (_b) => {
                let value = _b.value();
            }
            Lit::Char(_ch) =>{
                let value = _ch.value();
            }
            Lit::Int(_i) => {
                let value = _i.value();
            }
            Lit::Float(_f) =>{
                let value = _f.value();
            }
            Lit::Bool(_bo) => {
                let value = _bo.value;
            }
            _=>{

            }
         }
     }
     fn visit_expr_array(&mut self, node: &'ast ExprArray){
         let elements = &node.elems;
     }
     fn visit_expr_index(&mut self, node: &'ast ExprIndex){

     }
     fn visit_pat_ident(&mut self, node: &'ast PatIdent){
         let identifier = &node.ident;
     }
     fn visit_member(&mut self, node: &'ast Member){
     }
}



        // println!("{}",format!("{:#?}", fn_name));
