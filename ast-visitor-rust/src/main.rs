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
}
