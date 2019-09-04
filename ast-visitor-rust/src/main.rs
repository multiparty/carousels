use quote::quote;
use syn::visit::{self, Visit};
use syn::{File, ItemFn, FnDecl, Stmt, Lit, Expr, Local, ExprMethodCall,
    ExprBinary, ExprLit, ExprCall, ExprClosure, ExprUnary,
    ExprArray, ExprIndex, Member, Pat, BinOp};


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

    fn visit_local(&mut self, node: &'ast Local){
        let mut local = Node::default();
        let mut ident = &node.pats[0];
        let mut left = &node.init;

        local.typ = "Let".to_string();

        match ident{
            Pat::Ident(_p) =>{
                local.typ = "Ident".to_string();
                local.id = _p.ident.to_string();
            }
            Pat::Lit(_l)=>{
                local.typ = "Lit".to_string();
                local.visit_expr(&_l.expr);
            }
            Pat::Tuple(_t)=>{
                local.typ = "Tuple".to_string();
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

    fn visit_expr(&mut self, node: &'ast Expr){
        let mut expr = Node::default();
        match node{
            Expr::Array(_e)=>{
                expr.typ = "Array".to_string();
                expr.visit_expr_array(_e);
            }
            Expr::Call(_e)=>{
                expr.typ = "Call".to_string();
                expr.visit_expr_call(_e);
            }
            Expr::MethodCall(_e)=>{
                expr.typ = "MethodCall".to_string();
                expr.visit_expr_method_call(_e);
            }
            Expr::Tuple(_e)=>{
                expr.typ = "Tuple".to_string();
                expr.visit_expr_tuple(_e);
            }
            Expr::Binary(_e)=>{
                expr.typ = "Binary".to_string();
                expr.visit_expr_binary(_e);
            }
            Expr::Unary(_e)=>{
                expr.typ = "Unary".to_string();
                expr.visit_expr_unary(_e);
            }
            Expr::Lit(_e)=>{
                expr.typ = "Lit".to_string();
                expr.visit_expr_lit(_e);
            }
            Expr::If(_e)=>{
                expr.typ = "If".to_string();
                expr.visit_expr_if(_e);
            }
            Expr::Match(_e)=>{
                expr.typ = "Match".to_string();
                expr.visit_expr_match(_e);

            }
            Expr::Closure(_e)=>{
                expr.typ = "Closure".to_string();
                expr.visit_expr_closure(_e);

            }
            Expr::Block(_e)=>{
                expr.typ = "Block".to_string();
                expr.visit_expr_block(_e);
            }
            Expr::Return(_e)=>{
                expr.typ = "Return".to_string();
            }
            Expr::Paren(_e)=>{
                expr.typ = "Paren".to_string();
            }
            // Expr::Assign(_e)=>{
            //     expr.typ = "Assign".to_string();
            //     expr.visit_assign(_e);
            // }
            // Expr::AssignOp(_e)=>{
            //     expr.typ = "AssignOp".to_string();
            //     expr.visit_assign_op(_e);
            // }
            // Expr::Field(_e)=>{
            //     expr.typ = "Field".to_string();
            //     expr.visit_field(_e);
            // }
            // Expr::Index(_e)=>{
            //     expr.typ = "Index".to_string();
            //     expr.visit_index(_e);
            // }
            // Expr::Range(_e)=>{
            //     expr.typ = "Rnage".to_string();
            //     expr.visit_range(_e);
            //
            // }
            /////////////////////////////
            // Expr::InPlace(_e)=>{}
            // Expr::Loop(_e)=>{}
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
                expr.typ = "Notimplemented".to_string();
            }
        }
        self.children.push(expr);
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
        match op { // TODO: figure out how to unwrap in this case
            BinOp::Add(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Sub(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Mul(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Div(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Rem(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::And(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Or(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::BitXor(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::BitAnd(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::BitOr(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Shl(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Shr(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Eq(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Lt(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Le(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Ne(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Ge(_op) => {self.value = format!("{:#?}", _op);}
            BinOp::Gt(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::AddEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::SubEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::MulEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::DivEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::RemEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::BitXorEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::BitAndEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::BitOrEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::ShlEq(_op) => {self.value = format!("{:#?}", _op);}
            // BinOp::ShrEq(_op) => {self.value = format!("{:#?}", _op);}
            _=>{}
        }
        self.visit_expr(&*node.left);
        self.visit_bin_op(&node.op);
        self.visit_expr(&*node.right);
      }

    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        let mut literal = Node::default();
        let li = &node.lit;
        literal.visit_lit(li);
        self.children.push(literal);
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
