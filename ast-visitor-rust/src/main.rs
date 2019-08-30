use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, Stmt, Lit, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary,
    ExprArray, ExprIndex, PatIdent, Member, Pat, PatLit};

fn main() {
    let src = "
            fn main() {
            let x = 5 + 2;
            let mut array: [i32; 3] = [0; 3];
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();
    let mut visitor = FnVisitor { ir: Vec::new() };
    visitor.visit_file(&syntax);
}

// this.id = id;
// this.type = type;
// this.body = body;
// this.arg = arg;
// this.start = start;
// this.end = end;
// this.parent = parent;
// this.metric = metric;
// this.results = results;

struct FnVisitor {
    ir: Vec<Node>,
}

#[derive(Debug, Default)]
struct Node{
    id: String,
    typ: String,
    body: String,
    arg: String,
    parent: String,
    value: String
}


impl <'ast> Visit<'ast> for FnVisitor {
    fn visit_item_fn(&mut self, node: &'ast ItemFn){
        let fn_name = format!("{:#?}", &node.ident);
        let fn_body = format!("{:#?}", &node.block.stmts);
        let fn_node = Node {id: fn_name, typ: "function".to_string(), body:fn_body,
                            arg: "".to_string(), parent: "".to_string(), value: "".to_string()};

        println!("{}", format!("{:#?}", &node.block.stmts));
        self.ir.push(fn_node);

        for stmt in &node.block.stmts {
            self.visit_stmt(stmt);
        }
    }
    fn visit_stmt(&mut self, node: &'ast Stmt){
        let mut stmt_node = Node::default();
        match node {
            Stmt::Local(_loc)=>{
                let p = &_loc.pats[0];
                let init = &_loc.init;
                let ty = &_loc.ty;

                match p {
                    Pat::Ident(_p) =>{
                        self.visit_pat_ident(&_p);
                    }
                    Pat::Lit(_l)=>{
                        self.visit_pat_lit(&_l);
                    }
                    Pat::Tuple(_tpl)=>{
                        self.visit_pat_tuple(&_tpl);
                    }
                    _=>{

                    }
                }


            }
            Stmt::Item(_item)=>{

            }
            Stmt::Expr(_expr)=>{

            }
            Stmt::Semi(_expr, _semi)=>{

            }
        }
        self.ir.push(stmt_node);
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
