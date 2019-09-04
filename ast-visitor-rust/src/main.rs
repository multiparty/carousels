use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, Stmt, Lit, Expr, Local, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary,
    ExprArray, ExprIndex, Member, Pat};


#[derive(Debug, Default)]
struct Node{
    id: String,
    typ: String,
    parent_typ: String,
    value: String,
    children: Vec<Node>

}


fn main() {
    let src = "
            fn main() {
            let x = 5 + 2;
            let mut array: [i32; 3] = [0; 3];
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();

    let mut file = Node::default(); //highest node in the AST

    file.visit_file(&syntax);

}


impl <'ast> Visit <'ast> for Node {

    fn visit_item_fn(&mut self, node: &'ast ItemFn){ // TODO: implement if necessary other Items
                                                    // than fn definitions (like type def and structs)
        let fn_name = node.ident.to_string();
        let fn_type = "function".to_string();
        let mut fn_main = Node::default();
        fn_main.id = fn_name;
        fn_main.typ = fn_type;
        // println!("{}", format!("{:#?}", &node.block.stmts));

        for stmt in &node.block.stmts {
            let mut fn_stmt = Node::default();
            fn_stmt.visit_stmt(stmt);

            fn_main.visit_stmt(stmt); // call visit_stmt on each statement in the fn body
        }

        self.children.push(fn_main); // push each fn into the file node's children
    }

    fn visit_stmt(&mut self, node: &'ast Stmt){

        println!("{}", self.id);
        let mut stmt = Node::default();

        match node {
            Stmt::Local(_loc)=>{
                stmt.visit_local(_loc);
            }
            Stmt::Item(_item)=>{
                println!("{}", "Item");
                stmt.visit_item(_item);
            }
            Stmt::Expr(_expr)=>{
                println!("{}", "Expr");
                stmt.visit_expr(_expr);
            }
            Stmt::Semi(_expr, _semi)=>{
                println!("{}", "SemiExpr");
                stmt.visit_expr(_expr);
            }
        }
        self.children.push(stmt); // push each stmt into the fn node's children
    }

    fn visit_local(&mut self, node: &'ast Local){
        let mut local = Node::default();
        let mut ident = &node.pats[0];

        match ident{
            Pat::Ident(_p) =>{
                local.id = _p.ident.to_string();
            }
            Pat::Lit(_l)=>{
                local.visit_expr(&_l.expr);
            }
            Pat::Tuple(_t)=>{
                let front = &_t.front[0];
                let back = &_t.back[0];
                local.visit_pat(front);
                local.visit_pat(back);
            }
            _=>{

            }
        }
        self.children.push(local);
    }

    fn visit_expr(&mut self, node: &'ast Expr){
        match node{
            Expr::InPlace(_e)=>{

            }
            Expr::Array(_e)=>{

            }
            Expr::Call(_e)=>{

            }
            Expr::MethodCall(_e)=>{

            }
            Expr::Tuple(_e)=>{

            }
            Expr::Binary(_e)=>{

            }
            Expr::Unary(_e)=>{

            }
            Expr::Lit(_e)=>{

            }
            Expr::If(_e)=>{

            }
            Expr::Loop(_e)=>{

            }
            Expr::Match(_e)=>{

            }
            Expr::Closure(_e)=>{

            }
            Expr::Block(_e)=>{

            }
            Expr::Assign(_e)=>{

            }
            Expr::AssignOp(_e)=>{

            }
            Expr::Field(_e)=>{

            }
            Expr::Index(_e)=>{

            }
            Expr::Range(_e)=>{

            }
            Expr::Return(_e)=>{

            }
            Expr::Paren(_e)=>{

            }
            // Expr::Cast(_e)=>{}
            // Expr::Type(_e)=>{}
            // Expr::While(_e)=>{}
            // Expr::ForLoop(_e)=>{}
            // Expr::Unsafe(_e)=>{}
            // Expr::Box(_e)=>{}
            // Expr::Path(_e)=>{}
            // Expr::Break(_e)=>{}
            // Expr::Continue(_e)=>{}
            // Expr::Macro(_e)=>{}
            // Expr::Struct(_e)=>{}
            // Expr::Repeat(_e)=>{}
            // Expr::Group(_e)=>{}
            // Expr::Try(_e)=>{}
            // Expr::Catch(_e)=>{}
            // Expr::Yield(_e)=>{ }
            // Expr::Verbatim(_e)=>{}
            // Expr ::IfLet (_e)=>{}
            // Expr :: WhileLet (e)=>{}
            _=>{

            }
        }
    }

    fn visit_expr_call(&mut self, node: &'ast ExprCall){
    }
    fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
    }
    fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

    }
    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        let li = &node.lit;
        self.visit_lit(li);
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
         let mut value = String::new();
         match node{
            Lit::Str(_s)=>{
                value = _s.value();
            }
            Lit::ByteStr (_bs)=>{
                value = format!("{:#?}",_bs.value());
            }
            Lit::Byte (_b)=>{
                value = _b.value().to_string();
            }
            Lit::Char(_ch) =>{
                value = _ch.value().to_string();
            }
            Lit::Int(_i)=>{
                value = _i.value().to_string();
            }
            Lit::Float(_f) =>{
                value = _f.value().to_string();
            }
            Lit::Bool(_bo)=>{
                value = _bo.value.to_string();;
            }
            _=>{

            }
         }
         // let current_node = self.ir.pop();
         // match current_node {
         //     Some(_n)=>{
         //         let mut update_node = _n;
         //         update_node.value = value.to_string();
         //         self.ir.push(update_node);
         //     }
         //     None=>{
         //     }
         // }
     }
     fn visit_expr_array(&mut self, node: &'ast ExprArray){
         let elements = &node.elems;
     }
     fn visit_expr_index(&mut self, node: &'ast ExprIndex){

     }
     fn visit_member(&mut self, node: &'ast Member){
     }
}



        // println!("{}",format!("{:#?}", fn_name));
