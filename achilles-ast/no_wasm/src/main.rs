#![allow(unused_variables)]
#![allow(non_snake_case)]

#[macro_use]
extern crate syn;

use std::fs::File as FileSys;
use std::io::Read;
use std::error::Error;
use serde::{Deserialize, Serialize};
use syn::visit::{Visit};
use syn::{ItemFn, Lit, Expr, Local, Member, ExprAssign, ExprMethodCall,
    ExprBinary, ExprForLoop, ExprLit, ExprCall, ExprUnary, ExprRepeat, ExprReturn, ExprRange, ExprParen,
    ExprIf, ExprArray, ExprField, ExprIndex, ExprBlock, ExprPath, ExprMacro, Pat, BinOp, Ident, UnOp};
use syn::Result;
use syn::parse::{ParseStream, Parse};


#[derive(Debug, Default, Serialize, Deserialize)]
struct Node{
    name: String,
    value: String,

    type_: String,
    nodeType: String,
    returnType: String,
    secret: String,

    arity: String,
    operator: String,

    function: Vec<Node>,
    parameters: Vec<Node>,

    array: Vec<Node>,

    ifBody: Vec<Node>,
    elseBody: Vec<Node>,

    left: Vec<Node>,
    right: Vec<Node>,

    expression: Vec<Node>,
    condition: Vec<Node>,

    body: Vec<Node>,
    elements: Vec<Node>,
    operands: Vec<Node>,

    range: Vec<Node>,
    index: Vec<Node>,
    iterator: Vec<Node>,
    increment: Vec<Node>,
    repeat: Vec<Node>,
    length: Vec<Node>,
    initial: Vec<Node>,
    start: Vec<Node>,
    end: Vec<Node>,
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
        if lookahead.peek(kw::obliv) {
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

pub fn get_ast(val: &str) -> std::result::Result<String, Box<dyn Error>> {
    let syntax = syn::parse_file(val)?;

    let mut file = Node::default(); //highest node in the AST
    file.visit_file(&syntax);

    match serde_json::to_string_pretty(&file){
        Ok(_v)=>{Ok(_v)},
        Err(_e)=>{Ok("Error serializing".to_string())},
    }

}

impl <'ast> Visit <'ast> for Node {

    fn visit_item_fn(&mut self, node: &'ast ItemFn){
        let return_type = &node.sig.output;
        let input_param = &node.sig.inputs;

        // println!("{}", format!("{:#?}", &node.block.stmts));
        self.nodeType = "functionDefinition".to_string();
        self.name = node.sig.ident.to_string();

        for s in &node.block.stmts {
            let mut stmt = Node::default();
            stmt.visit_stmt(s); // call visit_stmt on each statement in the fn body
            self.body.push(stmt);
        }
    }

    fn visit_local(&mut self, node: &'ast Local){ // Let left = right;
        self.nodeType = "local".to_string();

        let mut definition = Node::default();
        definition.nodeType = "variableDefinition".to_string();

        let ident = &node.pat; // the variable declared
        match ident{
            Pat::Ident(_p)=>{
                definition.type_  = "variable".to_string();
                definition.visit_ident(&_p.ident);
            }
            Pat::Tuple(_t)=>{
                definition.type_ = "tuple".to_string();

                let mut left = Node::default();
                left.visit_pat(&_t.elems[0]);
                definition.left.push(left);

                let mut right = Node::default();
                right.visit_pat(&_t.elems[1]);
                definition.right.push(right);
            }
            // Pat::PatType(_p, _t)=>{
            //
            // }
            _=>{}
        }
        self.left.push(definition);

        let init = &node.init; // the initial value
        match init{
            Some(_e)=>{
                let mut assignment = Node::default();
                assignment.nodeType = "variableAssignment".to_string();
                assignment.visit_expr(&_e.1);
                self.right.push(assignment);
                self.operator = "=".to_string();
            }
            None =>{}
        }
    }
//
    fn visit_lit(&mut self, node: &'ast Lit){
        match node{
           Lit::Str(_s)=>{
               self.type_ = "str".to_string();
               self.value = _s.value();
           }
           Lit::ByteStr (_bs)=>{
               self.type_ = "byteStr".to_string();
               self.value = format!("{:#?}",_bs.value());
           }
           Lit::Byte (_b)=>{
               self.type_ = "byte".to_string();
               self.value = _b.value().to_string();
           }
           Lit::Char(_ch) =>{
               self.type_ = "char".to_string();
               self.value = _ch.value().to_string();
           }
           Lit::Int(_i)=>{
               self.type_ = "int".to_string();
               self.value = _i.base10_digits().to_string();
           }
           Lit::Float(_f) =>{
               self.type_ = "float".to_string();
               self.value = _f.base10_digits().to_string();
           }
           Lit::Bool(_bo)=>{
               self.type_ = "bool".to_string();
               self.value = _bo.value.to_string();
           }
           _=>{}
        }
    }

    fn visit_ident(&mut self, node: &'ast Ident){
        self.name = node.to_string();
    }
//
    fn visit_member(&mut self, node: &'ast Member){
        match node{
            Member::Named(_i)=>{ self.value = _i.to_string(); }
            Member::Unnamed(_i)=>{ self.value = _i.index.to_string();}
            }
    }
//
//
// //////////////////////////Expressions/////////////////////////////////////
//
    fn visit_expr(&mut self, node: &'ast Expr){

        match node {
                Expr::Array(_e)=>{
                    self.nodeType = "array".to_string();
                    self.visit_expr_array(_e);
                }
                Expr::Call(_e)=>{
                    self.nodeType = "Call".to_string();
                    self.visit_expr_call(_e);
                }
                Expr::MethodCall(_e)=>{
                    self.nodeType = "functionCall".to_string();
                    self.visit_expr_method_call(_e);
                }
                Expr::Tuple(_e)=>{
                    self.nodeType = "tuple".to_string();
                    self.visit_expr_tuple(_e);
                }
                Expr::Binary(_e)=>{
                    self.nodeType = "binaryExpression".to_string();
                    self.visit_expr_binary(_e);
                }
                Expr::Unary(_e)=>{
                    self.nodeType = "unaryExpression".to_string();
                    self.visit_expr_unary(_e);
                }
                Expr::Lit(_e)=>{
                    self.nodeType = "literalExpression".to_string();
                    self.visit_expr_lit(_e);
                }
                Expr::If(_e)=>{
                    self.nodeType = "if".to_string();
                    self.visit_expr_if(_e);
                }
                Expr::Block(_e)=>{
                    self.nodeType = "Block".to_string();
                    self.visit_expr_block(_e);
                }
                Expr::Assign(_e)=>{
                    self.nodeType = "variableAssignment".to_string();
                    self.visit_expr_assign(_e);
                }
                Expr::Field(_e)=>{
                    self.nodeType = "dotExpression".to_string();
                    self.visit_expr_field(_e);
                }
                Expr::Index(_e)=>{
                    self.nodeType = "indexExpression".to_string();
                    self.visit_expr_index(_e);
                }
                Expr::Range(_e)=>{
                    self.nodeType = "rangeExpression".to_string();
                    self.visit_expr_range(_e);
                }
                Expr::ForLoop(_e)=>{
                    self.nodeType = "for".to_string();
                    self.visit_expr_for_loop(_e);
                }
                Expr::Return(_e)=>{
                    self.nodeType = "returnExpression".to_string();
                    self.visit_expr_return(_e);
                }
                Expr::Paren(_e)=>{
                    self.nodeType = "parenthesisExpression".to_string();
                    self.visit_expr_paren(_e);
                }
                Expr::Path(_e)=>{
                    self.nodeType = "path".to_string();
                    self.visit_expr_path(_e);
                }
                Expr::Macro(_m)=>{
                    self.nodeType = "macro".to_string();
                    self.visit_expr_macro(_m);
                }
                _=>{}
            }

    }
//
//
//
    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
        let mut left = Node::default();
        let mut right = Node::default();

        left.visit_expr(&*node.left);
        self.operands.push(left);

        right.visit_expr(&*node.right);
        self.operands.push(right);

        match &node.op{
            BinOp::Add(_op) => {self.operator = "+".to_string();}
            BinOp::Sub(_op) => {self.operator = "-".to_string();}
            BinOp::Mul(_op) => {self.operator = "*".to_string();}
            BinOp::Div(_op) => {self.operator = "/".to_string();}
            BinOp::Rem(_op) => {self.operator = "%".to_string();}
            BinOp::And(_op) => {self.operator = "&&".to_string();}
            BinOp::Or(_op) => {self.operator = "||".to_string();}
            BinOp::BitXor(_op) => {self.operator = "^".to_string();}
            BinOp::BitAnd(_op) => {self.operator = "&".to_string();}
            BinOp::BitOr(_op) => {self.operator = "|".to_string();}
            BinOp::Shl(_op) => {self.operator = "<<".to_string();}
            BinOp::Shr(_op) => {self.operator = ">>".to_string();}
            BinOp::Eq(_op) => {self.operator = "==".to_string();}
            BinOp::Lt(_op) => {self.operator = "<".to_string();}
            BinOp::Le(_op) => {self.operator = "<=".to_string();}
            BinOp::Ne(_op) => {self.operator = "!=".to_string();}
            BinOp::Ge(_op) => {self.operator = ">".to_string();}
            BinOp::Gt(_op) => {self.operator = ">=".to_string();}
            _=>{} // Implement other operators if necessary
        }
//
      }
//
    fn visit_expr_unary(&mut self, node: &'ast ExprUnary){
        let mut operand = Node::default();
        operand.visit_expr(&node.expr);
        self.operands.push(operand);

        match node.op{
            UnOp::Not(_un)=>{self.operator = "!".to_string();}
            UnOp::Neg(_un)=>{self.operator = "~".to_string();}
            UnOp::Deref(_un)=>{self.operator = "*".to_string();}
        }

    }
//
    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        self.visit_lit(&node.lit);
    }
//
    fn visit_expr_path(&mut self, node: &'ast ExprPath){
        self.name = node.path.segments[0].ident.to_string();
    }
//
     fn visit_expr_assign(&mut self, node: &'ast ExprAssign){
         let mut left = Node::default();
         let mut right = Node::default();

         left.visit_expr(&node.left);
         right.visit_expr(&node.right);

         left.value = right.value.clone();
         right.name = left.name.clone();

         self.operator = "=".to_string();
         self.operands.push(left);
         self.operands.push(right);

     }
//
     fn visit_expr_call(&mut self, node: &'ast ExprCall){

         let mut function_call = Node::default();
         function_call.visit_expr(&node.func);

        for a in &node.args{
            let mut argument = Node::default();
            argument.visit_expr(a);
            function_call.parameters.push(argument);
        }
        self.function.push(function_call);
     }
//
     fn visit_expr_array(&mut self, node: &'ast ExprArray){

         for e in &node.elems{
             let mut element = Node::default();
             element.visit_expr(e);
             self.elements.push(element);
         }

     }

     fn visit_expr_index(&mut self, node: &'ast ExprIndex){
         let mut array = Node::default();
         let mut index = Node::default();

         array.visit_expr(&node.expr);
         self.array.push(array);

         index.visit_expr(&node.index);
         self.index.push(index);
     }

     fn visit_expr_if(&mut self, node: &'ast ExprIf){
         let mut condition = Node::default();
         let mut if_body = Node::default();
         let mut else_body = Node::default();

         condition.visit_expr(&node.cond);
         self.condition.push(condition);

         for s in &node.then_branch.stmts {
             let mut stmt = Node::default();
             stmt.visit_stmt(s); // call visit_stmt on each statement in the fn body
             self.ifBody.push(stmt);
         }

         match &node.else_branch{
             Some(_else)=>{
                 let (_t,_e) = _else;
                 else_body.visit_expr(_e);
             }
             None =>{}
         }
         self.elseBody.push(else_body);

     }
//      fn visit_expr_closure(&mut self, node: &'ast ExprClosure){
//
//      }
     fn visit_expr_return(&mut self, node: &'ast ExprReturn){
         let mut return_expr = Node::default();
         match &node.expr{
             Some(_e)=>{
                return_expr.visit_expr(&_e);
             }
             None =>{}
         }
         self.expression.push(return_expr);
     }
     fn visit_expr_repeat(&mut self, node: &'ast ExprRepeat){
         let mut repeat_expr = Node::default();
         let mut length = Node::default();
         let mut initial = Node::default();

         length.visit_expr(&*node.len);
         initial.visit_expr(&node.expr);

         repeat_expr.length.push(length);
         repeat_expr.initial.push(initial);

         self.repeat.push(repeat_expr);

     }
     fn visit_expr_paren(&mut self, node: &'ast ExprParen){
         let mut expr = Node::default();
         expr.visit_expr(&node.expr);
         self.expression.push(expr);
     }
     fn visit_expr_macro(&mut self, node: &'ast ExprMacro){ //TODO: check values you can pass to a macro
         self.name = node.mac.path.segments[0].ident.to_string();
         self.value = node.mac.tokens.to_string();
     }
     fn visit_expr_for_loop(&mut self, node: &'ast ExprForLoop){
         let mut iterator = Node::default();
         let mut range = Node::default();

         iterator.nodeType = "iterator".to_string();
         iterator.visit_pat(&node.pat);
         self.iterator.push(iterator);

         range.visit_expr(&node.expr);
         self.range.push(range);

         for s in &node.body.stmts {
             let mut stmt = Node::default();
             stmt.visit_stmt(s); // call visit_stmt on each statement in the fn body
             self.body.push(stmt);
         }
     }
     fn visit_expr_range(&mut self, node: &'ast ExprRange){// include a limit param
         match &node.from{
             Some(_f) =>{
                 let mut from = Node::default();
                 from.visit_expr(_f);
                 self.start.push(from);
             }
             None =>{}
         }

         match &node.to{
             Some(_t) =>{
                 let mut to = Node::default();
                 to.visit_expr(_t);
                 self.end.push(to);
             }
             None =>{}
         }
     }
     fn visit_expr_block(&mut self, node: &'ast ExprBlock){
     }
     fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
         let mut function = Node::default();
         let mut left = Node::default();
         let mut right = Node::default();
         let mut parameters = Node::default();


         function.nodeType = "dotExpression".to_string();
         right.name = node.method.to_string();
         left.visit_expr(&node.receiver);

         function.right.push(right);
         function.left.push(left);

         self.function.push(function);

         for p in node.args.iter(){
             let mut parameter = Node::default();
             parameter.visit_expr(p);
             self.parameters.push(parameter);
         }
     }
     fn visit_expr_field(&mut self, node: &'ast ExprField){
         let mut left = Node::default();
         let mut right = Node::default();

         left.visit_expr(&node.base);
         right.visit_member(&node.member);

         self.left.push(left);
         self.right.push(right);
         self.operator = ".".to_string();
     }

}
