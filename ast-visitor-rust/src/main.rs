use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, Stmt, Lit, Expr, Local, ExprAssign, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary,
    ExprArray, ExprIndex, Member, Pat, BinOp, Ident};


#[derive(Debug, Default)]
struct Node{
    id: String,
    typ: String,
    value: String,
    children: Vec<Node>

}


fn main() {
    let src = "
            fn main() {
            let x = 5 + 2;
            let mut array: [i32; 3] = [0, 1, 3];
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();

    let mut file = Node::default(); //highest node in the AST

    file.visit_file(&syntax);
    println!("{}", format!("{:#?}", file));

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
            fn_main.visit_stmt(stmt); // call visit_stmt on each statement in the fn body
        }

        self.children.push(fn_main); // push each fn into the file node's children
    }

    fn visit_stmt(&mut self, node: &'ast Stmt){//Not sure if needed.
        let mut stmt = Node::default();

        match node {
            Stmt::Local(_loc)=>{
                stmt.typ = "Local".to_string();
                stmt.visit_local(_loc);
            }
            Stmt::Item(_item)=>{
                stmt.typ = "Item".to_string();
                stmt.visit_item(_item);
            }
            Stmt::Expr(_expr)=>{
                let mut expr = Node::default();
                println!("{}", format!("{:#?}", &_expr));
                stmt.typ = "Expr".to_string();
                stmt.visit_expr(_expr);
            }
            Stmt::Semi(_expr, _semi)=>{
                stmt.visit_expr(_expr);
            }
        }
        self.children.push(stmt); // push each stmt into the fn node's children
    }

    fn visit_local(&mut self, node: &'ast Local){ //Not sure if needed.
        let mut local = Node::default();
        let mut ident = &node.pats[0];
        let mut left = &node.init;

        local.typ = "Let".to_string();

        match ident{
            Pat::Ident(_p) =>{
                local.visit_ident(&_p.ident);
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
            _=>{}
        }

        match left{
            Some(_e)=>{
                let expr = &_e.1;
                local.visit_expr(&expr);
            }
            None =>{}
        }
        self.children.push(local);
    }
    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
        let mut exp_binary = Node::default();
        let left = &node.left;
        let right = &node.right;
        let op = &node.op;
        match op { // TODO: figure out how to unwrap in this case
            BinOp::Add(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Sub(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Mul(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Div(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Rem(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::And(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Or(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::BitXor(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::BitAnd(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::BitOr(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Shl(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Shr(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Eq(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Lt(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Le(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Ne(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Ge(_op) => {exp_binary.value = format!("{:#?}", _op);}
            BinOp::Gt(_op) => {exp_binary.value = format!("{:#?}", _op);}
            // BinOp::AddEq(_op) => {self.value = format!("{:#?}", _op);} // Requires Expr_Assign_Op
            // BinOp::SubEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::MulEq(_op) => {self.value = format!("{:#?}", _op);}
            _=>{} // Implement other operators if necessary
        }
        exp_binary.visit_expr(&*node.left);
        exp_binary.visit_expr(&*node.right);
        self.children.push(exp_binary);
      }

    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        let mut exp_lit = Node::default();
        let li = &node.lit;
        exp_lit.visit_lit(li);
        self.children.push(exp_lit);
    }

     fn visit_lit(&mut self, node: &'ast Lit){
         match node{
            Lit::Str(_s)=>{self.value = _s.value();}
            Lit::ByteStr (_bs)=>{self.value = format!("{:#?}",_bs.value());}
            Lit::Byte (_b)=>{self.value = _b.value().to_string();}
            Lit::Char(_ch) =>{self.value = _ch.value().to_string();}
            Lit::Int(_i)=>{self.value = _i.value().to_string();}
            Lit::Float(_f) =>{self.value = _f.value().to_string();}
            Lit::Bool(_bo)=>{self.value = _bo.value.to_string();}
            _=>{}
         }
     }
     fn visit_ident(&mut self, node: &'ast Ident){
         let mut ident = Node::default();
         ident.id = node.to_string();
     }
     fn visit_expr_assign(&mut self, node: &'ast ExprAssign){
         let mut assignment = Node::default();
         let left = &node.left;
         let right = &node.right;

         assignment.id = "=".to_string();
         assignment.visit_expr(left);
         assignment.visit_expr(right);
     }
     fn visit_expr_call(&mut self, node: &'ast ExprCall){
     }
     fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
     }
     fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

     }
     fn visit_expr_array(&mut self, node: &'ast ExprArray){
         let elements = &node.elems;
         let array = Node::default();
     }
     fn visit_expr_index(&mut self, node: &'ast ExprIndex){

     }
     fn visit_member(&mut self, node: &'ast Member){
     }
}


        // println!("{}",format!("{:#?}", fn_name));
