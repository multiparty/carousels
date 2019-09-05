use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, Stmt, Lit, Expr, Local, ExprAssign, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary, ExprRepeat, ExprReturn, ExprRange, ExprParen,
    ExprIf, ExprArray, ExprIndex, ExprBlock, Member, Pat, BinOp, Ident, UnOp};


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
            let x = add(a,b);
            let mut array: [i32; 3] = [0, 1, 3];
            }
            fn add(a: i64, b:i64){
                return a+b;
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();

    let mut file = Node::default(); //highest node in the AST
    file.id = "File".to_string();
    file.visit_file(&syntax);

    println!("{}", format!("{:#?}", file));

}


impl <'ast> Visit <'ast> for Node {

    fn visit_item_fn(&mut self, node: &'ast ItemFn){ // TODO: implement if necessary other Items

        let mut fn_main = Node::default();
        fn_main.id = node.ident.to_string();
        fn_main.typ = "function".to_string();
        // println!("{}", format!("{:#?}", &node.block.stmts));

        for stmt in &node.block.stmts {
            fn_main.visit_stmt(stmt); // call visit_stmt on each statement in the fn body
        }

        self.children.push(fn_main); // push each fn into the file node's children
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
        exp_binary.value = format!("{:#?}", op);
        exp_binary.typ = "Binary Expression".to_string();
        exp_binary.visit_expr(&*node.left);
        exp_binary.visit_expr(&*node.right);
        self.children.push(exp_binary);
      }

    fn visit_expr_unary(&mut self, node: &'ast ExprUnary){
        let mut unary_expr = Node::default();
        unary_expr.typ = "Unary Expression".to_string();
        let op = node.op;
        let expr = &node.expr;
        match op{
            UnOp::Not(_un)=>{
                unary_expr.value = "Not".to_string();
            }
            UnOp::Neg(_un)=>{
                unary_expr.value = "Neg".to_string();
            }
            UnOp::Deref(_un)=>{
                unary_expr.value = "Dereference".to_string();
            }
        }
        unary_expr.visit_expr(expr);
        self.children.push(unary_expr);
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
         let id = node.to_string();
         ident.id = id;
         ident.typ = "Variable".to_string();
         self.children.push(ident);

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
         let mut expr_call = Node::default();

         let expr_func = &node.func;
         expr_call.typ = "Call Expression".to_string();

         expr_call.visit_expr(expr_func);
         for arg in &node.args{
            expr_call.visit_expr(arg);
         }

         self.children.push(expr_call);
     }

     fn visit_expr_array(&mut self, node: &'ast ExprArray){
         let elements = &node.elems;
         let mut array = Node::default();
         array.typ = "Array".to_string();
         self.children.push(array);
     }

     fn visit_expr_index(&mut self, node: &'ast ExprIndex){
         let mut expr_ind = Node::default();
         let ind = &node.index;
         let expr = &node.expr;

         expr_ind.typ = "Array Access".to_string();
         expr_ind.visit_expr(expr);
         expr_ind.visit_expr(ind);
         self.children.push(expr_ind);
     }

     fn visit_member(&mut self, node: &'ast Member){
         let mut member = Node::default();
         member.typ = "Member of struct/tuple".to_string();
         match node{
             Member::Named(_i)=>{ member.value = _i.to_string(); }
             Member::Unnamed(_i)=>{ member.value = _i.index.to_string();}
             }
         self.children.push(member);
     }

     fn visit_expr_if(&mut self, node: &'ast ExprIf){
         let mut if_expr = Node::default();
         if_expr.typ = "If".to_string();

     }
     fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

     }
     fn visit_expr_return(&mut self, node: &'ast ExprReturn){
         let mut return_expr = Node::default();
         let expr = &node.expr;
         return_expr.typ = "Return".to_string();

         match expr{
             Some(_e)=>{ return_expr.visit_expr(&_e); }
             None =>{}
         }
     }
     fn visit_expr_repeat(&mut self, node: &'ast ExprRepeat){
         let mut expr_repeat = Node::default();
         expr_repeat.typ = "Array initialization".to_string();

         let len = &*node.len;
         expr_repeat.visit_expr(len);

         let init_expr = &node.expr;
         expr_repeat.visit_expr(init_expr);

         self.children.push(expr_repeat);

     }
     fn visit_expr_paren(&mut self, node: &'ast ExprParen){

     }
     fn visit_expr_range(&mut self, node: &'ast ExprRange){

     }
     fn visit_expr_block(&mut self, node: &'ast ExprBlock){

     }
}



        // println!("{}",format!("{:#?}", fn_name));
