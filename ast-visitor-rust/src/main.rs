use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, ExprBinary, ExprLit};

fn main() {
    let src = "
            fn main() {
            let x = 5 + 2;
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();
    FnVisitor.visit_file(&syntax);
}

struct FnVisitor;

impl<'ast> Visit<'ast> for FnVisitor {
    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
          for attr in &node.attrs {
              self.visit_attribute(attr);
          }
          self.visit_expr(&*node.left);
          self.visit_bin_op(&node.op);
          self.visit_expr(&*node.right);
      }
     fn visit_expr_lit(&mut self, node: &'ast ExprLit){
         println!("{}", format!("{:#?}", node.lit));
     }
}
