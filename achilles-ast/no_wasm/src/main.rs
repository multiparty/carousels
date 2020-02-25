#[macro_use]
extern crate syn;

use std::fs::File as FileSys;
use std::io::Read;
use std::error::Error;
use serde::{Deserialize, Serialize};
use syn::visit::{Visit};
use syn::{File, ItemFn, Stmt, Lit, Expr, Local, ExprAssign, ExprMethodCall, Item,
    ExprBinary, ExprForLoop, ExprLit, ExprCall, ExprClosure, ExprUnary, ExprRepeat, ExprReturn, ExprRange, ExprParen,
    ExprIf, ExprArray, ExprIndex, ExprBlock, ExprPath, ExprMacro, Member, Pat, BinOp, Ident, UnOp, Block, Attribute};
use syn::Token;
use syn::{token::If, token::Else, token::Bang};
use syn::Result;
use syn::parse::{ParseStream, Parse};


#[derive(Debug, Default, Serialize, Deserialize)]
struct Node{
    id: String,
    typ: String,
    value: String,
    context: String,
    parent: String,
    children: Vec<Node>
}

mod kw {
    custom_keyword!(obliv);
}

pub struct OblivIf {
    pub obliv_token: kw::obliv,
    pub if_expr: syn::ExprIf
}


impl Parse for OblivIf {
    fn parse(input: ParseStream) -> Result<Self> {
        let lookahead = input.lookahead1();
        if(lookahead.peek(kw::obliv)){
            println!("hello there!");
            let obliv_token =input.parse::<kw::obliv>()?;
            let if_expr: ExprIf = input.parse()?;

            Ok(OblivIf{obliv_token, if_expr})
        }else{
            println!("hello there!");
            Err(lookahead.error())
        }
    }
}

pub fn main(){
    let mut file = FileSys::open("src/test_hello.rs").unwrap();
    let mut content = String::new();

    file.read_to_string(&mut content).unwrap();
    println!("{}", content);
    match get_ast(&content) {
        Ok(_v)=>{println!("{}", _v)},
        Err(e) => println!("error parsing : {:?}", e),
    };

}





// This is like the `main` function, except for JavaScript.

pub fn get_ast(val: &str) -> std::result::Result<String, Box<Error>> {
    let syntax = syn::parse_file(val)?;

    let mut file = Node::default(); //highest node in the AST
    file.visit_file(&syntax);
    match serde_json::to_string_pretty(&file){
        Ok(_v)=>{Ok(_v)},
        Err(_e)=>{Ok("Error serializing".to_string())},
    }

}

impl <'ast> Visit <'ast> for Node {

    fn visit_file(&mut self, node: &'ast File){ // For Readability
        self.value = "File".to_string();

        for i in &node.items {
            let mut item = Node::default();
            item.parent = "File".to_string();
            item.visit_item(i);

            self.children.push(item);
        }
    }

    fn visit_item_fn(&mut self, node: &'ast ItemFn){

        // println!("{}", format!("{:#?}", &node.block.stmts));
        //self.value = node.ident.to_string(); //TODO get function name/signature in string
        //representation
        self.typ = "Function".to_string();

        for s in &node.block.stmts {
            let mut stmt = Node::default();
            stmt.parent = "Function".to_string();
            stmt.visit_stmt(s); // call visit_stmt on each statement in the fn body

            self.children.push(stmt);
        }
    }

    fn visit_local(&mut self, node: &'ast Local){ // Let left = right;
        self.typ = "Let".to_string();

        let mut left = Node::default();
        let ident = &node.pat; // the variable declared

        left.parent = "Let".to_string();
        left.context = "Declaration".to_string();

        match ident{
            Pat::Ident(_p) =>{
                left.typ = "Variable".to_string();
                left.visit_ident(&_p.ident);
            }
            Pat::Lit(_l)=>{
                left.typ = "Literal".to_string();
                left.visit_expr(&_l.expr);
            }
            Pat::Tuple(_t)=>{
                left.typ = "Tuple".to_string();

                let mut left_tuple = Node::default();
                let front = &_t.elems[0]; //TODO confirm this is the correct access/value
                left.context = "Front".to_string();
                left_tuple.visit_pat(front);
                left.children.push(left_tuple);

                let mut right_tuple = Node::default();
                let back = &_t.elems[1];//TODO confirm this is the correct access/value
                left.context = "Back".to_string();
                right_tuple.visit_pat(back);
                left.children.push(right_tuple);
            }
            _=>{}
        }
        self.children.push(left);

        let init = &node.init; // the initial value
        match init{
            Some(_e)=>{
                let mut right = Node::default();
                let expr = &_e.1;
                right.parent = "Let".to_string();
                right.context = "Init".to_string();

                right.visit_expr(&expr);

                self.children.push(right);
            }
            None =>{}
        }
    }

    fn visit_lit(&mut self, node: &'ast Lit){
        match node{
           Lit::Str(_s)=>{self.value = _s.value();}
           Lit::ByteStr (_bs)=>{self.value = format!("{:#?}",_bs.value());}
           Lit::Byte (_b)=>{self.value = _b.value().to_string();}
           Lit::Char(_ch) =>{self.value = _ch.value().to_string();}
           Lit::Int(_i)=>{self.value = _i.base10_digits().to_string();}
           Lit::Float(_f) =>{self.value = _f.base10_digits().to_string();}
           Lit::Bool(_bo)=>{self.value = _bo.value.to_string();}
           _=>{}
        }
    }

    fn visit_ident(&mut self, node: &'ast Ident){
        self.value = node.to_string();
    }

    fn visit_member(&mut self, node: &'ast Member){
        let mut member = Node::default();
        member.typ = "Member".to_string();
        match node{
            Member::Named(_i)=>{ member.value = _i.to_string(); }
            Member::Unnamed(_i)=>{ member.value = _i.index.to_string();}
            }
        self.children.push(member);
    }


//////////////////////////Expressions/////////////////////////////////////

    fn visit_expr(&mut self, node: &'ast Expr){

        match node {
                Expr::Array(_e)=>{
                    self.typ = "Array".to_string();
                    self.visit_expr_array(_e);
                }
                Expr::Call(_e)=>{
                    self.typ = "Call".to_string();
                    self.visit_expr_call(_e);
                }
                Expr::MethodCall(_e)=>{
                    self.typ = "Method Call".to_string();
                    self.visit_expr_method_call(_e);
                }
                Expr::Tuple(_e)=>{
                    self.typ = "Tuple".to_string();
                    self.visit_expr_tuple(_e);
                }
                Expr::Binary(_e)=>{
                    self.typ = "Binary Expr".to_string();
                    self.visit_expr_binary(_e);
                }
                Expr::Unary(_e)=>{
                    self.typ = "Unary Expr".to_string();
                    self.visit_expr_unary(_e);
                }
                Expr::Lit(_e)=>{
                    self.typ = "Literal".to_string();
                    self.visit_expr_lit(_e);
                }
                Expr::If(_e)=>{
                    self.typ = "If".to_string();
                    self.visit_expr_if(_e);
                }
                Expr::Block(_e)=>{
                    self.typ = "Block".to_string();
                    self.visit_expr_block(_e);
                }
                Expr::Assign(_e)=>{
                    self.typ = "Assignment".to_string();
                    self.visit_expr_assign(_e);
                }
                Expr::Field(_e)=>{
                    self.typ = "Field".to_string();
                    self.visit_expr_field(_e);
                }
                Expr::Index(_e)=>{
                    self.typ = "Index".to_string();
                    self.visit_expr_index(_e);
                }
                Expr::Range(_e)=>{
                    self.typ = "Range".to_string();
                    self.visit_expr_range(_e);
                }
                Expr::ForLoop(_e)=>{
                    self.typ = "ForLoop".to_string();
                    self.visit_expr_for_loop(_e);
                }
                Expr::Return(_e)=>{
                    self.typ = "Return".to_string();
                    self.visit_expr_return(_e);
                }
                Expr::Paren(_e)=>{
                    self.typ = "Paren".to_string();
                    self.visit_expr_paren(_e);
                }
                Expr::Path(_e)=>{
                    self.typ = "Path".to_string();
                    self.visit_expr_path(_e);
                }
                Expr::Macro(_m)=>{
                    self.typ = "Macro".to_string();
                    self.visit_expr_macro(_m);
                }
                _=>{}
            }

    }



    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {

        let op = &node.op;
        match op { // TODO: figure out how to unwrap in this case
            BinOp::Add(_op) => {self.value = "+".to_string();}
            BinOp::Sub(_op) => {self.value = "-".to_string();}
            BinOp::Mul(_op) => {self.value = "*".to_string();}
            BinOp::Div(_op) => {self.value = "/".to_string();}
            BinOp::Rem(_op) => {self.value = "%".to_string();}
            BinOp::And(_op) => {self.value = "&&".to_string();}
            BinOp::Or(_op) => {self.value = "||".to_string();}
            BinOp::BitXor(_op) => {self.value = "^".to_string(); self.context = "Binary".to_string()}
            BinOp::BitAnd(_op) => {self.value = "&".to_string(); self.context = "Binary".to_string()}
            BinOp::BitOr(_op) => {self.value = "|".to_string(); self.context = "Binary".to_string()}
            BinOp::Shl(_op) => {self.value = "<<".to_string();}
            BinOp::Shr(_op) => {self.value = ">>".to_string();}
            BinOp::Eq(_op) => {self.value = "==".to_string();}
            BinOp::Lt(_op) => {self.value = "<".to_string();}
            BinOp::Le(_op) => {self.value = "<=".to_string();}
            BinOp::Ne(_op) => {self.value = "!=".to_string();}
            BinOp::Ge(_op) => {self.value = ">".to_string();}
            BinOp::Gt(_op) => {self.value = ">=".to_string();}
            _=>{} // Implement other operators if necessary
        }

        let mut left = Node::default();
        left.parent = "Binary Expr".to_string();
        left.context = "Left".to_string();
        left.visit_expr(&*node.left);

        self.children.push(left);

        let mut right = Node::default();
        right.parent = "Binary Expr".to_string();
        right.context = "Right".to_string();
        right.visit_expr(&*node.right);

        self.children.push(right);
      }

    fn visit_expr_unary(&mut self, node: &'ast ExprUnary){
        let op = node.op;
        let expr = &node.expr;
        match op{
            UnOp::Not(_un)=>{self.value = "!".to_string();}
            UnOp::Neg(_un)=>{self.value = "~".to_string();}
            UnOp::Deref(_un)=>{self.value = "*".to_string();}
        }

        let mut operand = Node::default();
        operand.parent = "Unary Expr".to_string();
        operand.context = "Operand".to_string();
        operand.visit_expr(expr);

        self.children.push(operand);
    }

    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        let li = &node.lit;
        self.visit_lit(li);
    }

    fn visit_expr_path(&mut self, node: &'ast ExprPath){
        let p = &node.path.segments[0];
        self.id = p.ident.to_string();
    }

     fn visit_expr_assign(&mut self, node: &'ast ExprAssign){
        self.value = "=".to_string();

         let mut left = Node::default();
         left.parent = "Assignement".to_string();
         left.context = "Left".to_string();
         left.visit_expr(&node.left);

         self.children.push(left);

         let mut right = Node::default();
         right.parent = "Assignement".to_string();
         right.context = "Right".to_string();
         right.visit_expr(&node.right);

         self.children.push(right);
     }

     fn visit_expr_call(&mut self, node: &'ast ExprCall){
         let mut func_call = Node::default();
         func_call.parent = "Call".to_string();
         func_call.context = "Callee".to_string();
         func_call.visit_expr(&node.func);

         self.children.push(func_call);

        for a in &node.args{
            let mut argument = Node::default();
            argument.parent = "Call".to_string();
            argument.context = "Argument".to_string();
            argument.visit_expr(a);

            self.children.push(argument);
        }
     }

     fn visit_expr_array(&mut self, node: &'ast ExprArray){
         let elements = &node.elems;

         for e in elements{
             let mut element = Node::default();
             element.context = "Array Element".to_string();
             element.parent = "Array".to_string();
             element.visit_expr(e);

             self.children.push(element);
         }
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

     fn visit_expr_if(&mut self, node: &'ast ExprIf){
         let mut if_expr = Node::default();
         if_expr.typ = "If".to_string();

     }
     fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

     }
     fn visit_expr_return(&mut self, node: &'ast ExprReturn){
         let mut return_expr = Node::default();
         let expr = &node.expr;

         match expr{
             Some(_e)=>{
                 return_expr.context = "Returnee".to_string();
                 return_expr.parent = "Return".to_string();
                 return_expr.visit_expr(&_e);
             }
             None =>{}
         }
         self.children.push(return_expr)
     }
     fn visit_expr_repeat(&mut self, node: &'ast ExprRepeat){
         let mut expr_repeat = Node::default();
         expr_repeat.typ = "Array Init".to_string();

         let len = &*node.len;
         expr_repeat.visit_expr(len);

         let init_expr = &node.expr;
         expr_repeat.visit_expr(init_expr);

         self.children.push(expr_repeat);

     }
     fn visit_expr_paren(&mut self, node: &'ast ExprParen){
         let mut expr = Node::default();
         expr.visit_expr(&node.expr);
         self.children.push(expr);
     }
     fn visit_expr_macro(&mut self, node: &'ast ExprMacro){ //TODO: check values you can pass to a macro
         let p = &node.mac.path.segments[0];
         let t = &node.mac.tokens.to_string(); //TODO: this use to be tts.to_string(), what were we looking for?
         self.id = p.ident.to_string();
         self.value = t.to_string(); // potentially change this, may be messy depending on what counts as a macro
     }
     fn visit_expr_for_loop(&mut self, node: &'ast ExprForLoop){
     }
     fn visit_expr_range(&mut self, node: &'ast ExprRange){
         let mut from = Node::default();
         from.parent = "Range Expr".to_string();
         from.context = "From".to_string();
         let _from = &node.from;
         match _from{
             Some(_f) =>{
                 from.visit_expr(&_f);
             }
             None =>{}
         }
         let mut to = Node::default();
         to.parent = "Range Expr".to_string();
         to.context = "To".to_string();
         let _to = &node.to;
         match _to{
             Some(_t) =>{
                 to.visit_expr(&_t);
             }
             None =>{}
         }
         self.children.push(from);
         self.children.push(to);
     }
     fn visit_expr_block(&mut self, node: &'ast ExprBlock){
     }
     fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
     }

}
