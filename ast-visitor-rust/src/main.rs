use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary,
    ExprArray, ExprIndex, PatIdent, Member};

fn main() {
    let src = "
            fn main() {
            let x = 5 + 2;
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
    fn visit_fn_decl(&mut self, node: &'ast FnDecl){

    }
    fn visit_expr_call(&mut self, node: &'ast ExprCall){

    }
    fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){

    }
    fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

    }
    fn visit_expr_unary(&mut self, node: &'ast ExprUnary){

    }
    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
          for attr in &node.attrs {
              self.visit_attribute(attr);
          }
          self.visit_expr(&*node.left);
          self.visit_bin_op(&node.op);
          self.visit_expr(&*node.right);
      }
     fn visit_expr_lit(&mut self, node: &'ast ExprLit){
          self.ir.push(format!("{:#?}", node.lit));
     }
     fn visit_expr_array(&mut self, node: &'ast ExprArray){

     }
     fn visit_expr_index(&mut self, node: &'ast ExprIndex){

     }
     fn visit_pat_ident(&mut self, node: &'ast PatIdent){

     }
     fn visit_member(&mut self, node: &'ast Member){
     }
}
