use crate::ir::*;

use std::fs::File as FileSys;
use std::io::Read;
use std::error::Error;
use syn::visit::{Visit};
use syn::{ItemFn, Lit, Expr, Local, Member, Type,TypeParamBound, Path, PathArguments, GenericArgument, FnArg, ReturnType, ExprAssign, ExprMethodCall,
    ExprBinary, ExprForLoop, ExprLit, ExprCall, ExprUnary, ExprRepeat, ExprReturn, ExprRange, ExprParen,
    ExprIf, ExprArray, ExprField, ExprIndex, ExprPath, ExprMacro, Pat, BinOp, Ident, UnOp};

static NUMERICTYPES: [&str; 8] = ["u8","u16","u32","u128","u128","u128","i32","i128"];

pub fn get_ast_str_from_file(val: &str) -> std::result::Result<String, Box<dyn Error>> {
    let mut file = FileSys::open(val).unwrap();
    let mut content = String::new();

    file.read_to_string(&mut content).unwrap();
    let syntax = syn::parse_file(&content)?;

    let mut file = Node::default(); //highest node in the AST
    file.visit_file(&syntax);

    match serde_json::to_string_pretty(&file){
        Ok(_v)=>{Ok(_v)},
        Err(_e)=>{Ok("Error serializing".to_string())},
    }

}
/// for wasm use, returns just a String
pub fn get_ast_str(val: &str) -> String {
    let syntax = match syn::parse_file(&val){
        Ok(v) => v,
        Err(e) => {return "Error parsing rust code".to_string()},
    };

    let mut file = Node::default(); //highest node in the AST
    file.visit_file(&syntax);

    match serde_json::to_string_pretty(&file){
        Ok(_v)=>{_v},
        Err(_e)=>{"Error serializing".to_string()},
    }

}

pub fn get_ast(val: &str) -> std::result::Result<Node, Box<dyn Error>> {
    let mut file = FileSys::open(val).unwrap();
    let mut content = String::new();

    file.read_to_string(&mut content).unwrap();
    //println!("{}", content);
    let syntax = syn::parse_file(&content)?;

    let mut file = Node::default(); //highest node in the AST
    file.visit_file(&syntax);
    Ok(file)

}

impl <'ast> Visit <'ast> for Node {

    fn visit_item_fn(&mut self, node: &'ast ItemFn){
        // TODO: handle return type and input parameters
        let return_type = &node.sig.output;
        let input_param = &node.sig.inputs;
        let returnType = Node::default();
        let mut nameExpression = Node::default();

        // println!("{}", format!("{:#?}", &node.block.stmts));
        self.nodeType = "FunctionDefinition".to_string();

        nameExpression.nodeType = "NameExpression".to_string();
        nameExpression.name = node.sig.ident.to_string();
        self.nameNode.push(nameExpression);

        for inp in &node.sig.inputs{
            let mut input = Node::default();
            match inp{
                FnArg::Receiver(_r)=>{
                    let mut inputName = Node::default();
                    inputName.nodeType = "NameExpression".to_string();
                    inputName.name = "self".to_string();

                    input.nameNode.push(inputName);

                    let mut typeNode = Node::default();
                    typeNode.nodeType = "TypeNode".to_string();
                    typeNode.type_ = "any".to_string();

                    input.typeNode.push(typeNode);
                }
                FnArg::Typed(_t)=>{
                    input.visit_pat(&_t.pat);

                    let mut typeNode = Node::default();
                    typeNode.nodeType = "TypeNode".to_string();
                    typeNode.visit_type(&_t.ty);
                    input.typeNode.push(typeNode);
                }
            }
            input.nodeType = "VariableDefinition".to_string();

            self.parameters.push(input);
        }

        match &node.sig.output {
            ReturnType::Type(_ , _t)=>{
                let mut returnType = Node::default();
                returnType.nodeType = "TypeNode".to_string();
                returnType.visit_type(_t);
                self.returnType.push(returnType);
            }
            _=>{}
        }

        for s in &node.block.stmts {
            let mut stmt = Node::default();
            stmt.visit_stmt(s); // call visit_stmt on each statement in the fn body
            self.body.push(stmt);
        }
    }

    fn visit_local(&mut self, node: &'ast Local){ // Let left = right;
        self.nodeType = "VariableDefinition".to_string();

        let ident = &node.pat; // the variable declared
        match ident{
            Pat::Ident(_p)=>{
                let mut typeNode = Node::default();
                typeNode.type_  = "variable".to_string();
                self.typeNode.push(typeNode);
                self.visit_ident(&_p.ident);
            }
            Pat::Tuple(_t)=>{
                let mut typeNode = Node::default();
                typeNode.type_  = "tuple".to_string();
                self.typeNode.push(typeNode);

                let mut right = Node::default();
                let mut left = Node::default();

                left.visit_pat(&_t.elems[0]);
                self.left.push(left);

                right.visit_pat(&_t.elems[1]);
                self.right.push(right);
            }
            Pat::Type(_t)=>{
                self.visit_pat(&_t.pat);

                let mut typeNode = Node::default();
                typeNode.type_  = "variable".to_string();
                typeNode.visit_type(&_t.ty);

                self.typeNode.push(typeNode);
            }
            _=>{}
        }

        let init = &node.init; // the initial value
        match init{
            Some(_e)=>{
                let mut assignment = Node::default();

                assignment.nodeType = "variableAssignment".to_string();
                assignment.visit_expr(&_e.1);

                self.expression.push(assignment);
                self.operator = "=".to_string();
            }
            None =>{}
        }
    }

    fn visit_type(&mut self, node: &'ast Type){
        // println!("{}", format!("{:#?}", &node));
        match node{
            Type::Array(_a)=>{
                self.dependentType.push_str(&"[".to_string());
                self.visit_type(&_a.elem);
                self.dependentType.push_str(&"]".to_string());

                let mut length = Node::default();
                length.nodeType = "length".to_string();
                length.visit_expr(&_a.len);
                self.length.push(length);
            }
            Type::Path(_p)=>{
                self.visit_path(&_p.path);
            }
            Type::Ptr(_ptr)=>{
                self.dependentType.push_str(&"*".to_string());
                self.visit_type(&_ptr.elem);
            }
            Type::Reference(_r)=>{
                self.dependentType.push_str(&"&".to_string());
                self.visit_type(&_r.elem);
            }
            Type::Slice(_s)=>{
                self.dependentType.push_str(&"[".to_string());
                self.visit_type(&_s.elem);
                self.dependentType.push_str(&"]".to_string());
            }
            Type::Verbatim(_v)=>{
                self.dependentType.push_str(&_v.to_string());
            }
            _=>{}
        }
    }

    fn visit_path(&mut self, node: &'ast Path){

        match &node.leading_colon{
            Some(c)=>{
                self.type_.push_str(&"::".to_string());
            }
            None=>{}
        }

        for ps in node.segments.iter(){

            let ident = ps.ident.to_string();
            self.dependentType.push_str(&ident);

            if ident == "Possession"{
                self.secret = true;
            }

            if self.type_.is_empty(){
                if ident == "Vec" {
                    self.type_ = "array".to_string();
                }
                else if ident == "bool".to_string() || ident == "str".to_string()
                        || ident == "char".to_string() {
                    self.type_ = ident;
                }
                else{
                    for n in &NUMERICTYPES {
                        if ident == n.to_string(){
                            self.type_ = "number".to_string();
                        }
                    }
                }

            }

            match &ps.arguments{
                PathArguments::AngleBracketed(_a)=>{

                self.dependentType.push_str(&"<".to_string());

                    for _arg in _a.args.iter(){
                        match _arg {
                            GenericArgument::Type(_t)=>{
                                self.visit_type(_t);
                            }
                            GenericArgument::Binding(_b)=>{
                                let identb = _b.ident.to_string();
                                if identb == "Possession"{
                                    self.secret = true;
                                }
                                self.visit_type(&_b.ty);
                            }
                            GenericArgument::Constraint(_c)=>{
                                let identc = _c.ident.to_string();
                                if identc == "Possession"{
                                    self.secret = true;
                                }
                                for b in _c.bounds.iter(){
                                    match b{
                                        TypeParamBound::Trait(_tr)=>{
                                            self.visit_path(&_tr.path);
                                        }
                                        _=>{}
                                    }
                                }
                            }
                            _=>{}
                        }
                        self.dependentType.push_str(&",".to_string());
                    }
                    self.dependentType.pop();
                    self.dependentType.push_str(&">".to_string());
                }
                PathArguments::Parenthesized(_p)=>{
                    let mut inputType = Node::default();
                    inputType.nodeType = "inputType".to_string();
                    inputType.dependentType.push_str(&"(".to_string());

                    for inp in _p.inputs.iter(){
                        inputType.visit_type(inp);
                        inputType.dependentType.push_str(&",".to_string());
                    }
                    inputType.dependentType.pop();
                    inputType.dependentType.push_str(&")".to_string());

                    self.dependentType.push_str(&inputType.dependentType);

                    match &_p.output{
                        ReturnType::Type(_, _t)=>{
                            let mut outputType = Node::default();
                            outputType.nodeType = "TypeNode".to_string();
                            outputType.visit_type(_t);

                            self.dependentType.push_str(&"->".to_string());
                            self.dependentType.push_str(&outputType.dependentType.clone());
                            self.returnType.push(outputType);
                        }
                        _=>{}
                    }
                }
                _=>{}
            }
        }
    }

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
        let mut nameExpression = Node::default();
        nameExpression.nodeType = "NameExpression".to_string();
        nameExpression.name = node.to_string();

        self.nameNode.push(nameExpression);
    }

    fn visit_member(&mut self, node: &'ast Member){
        match node{
            Member::Named(_i)=>{ self.value = _i.to_string(); }
            Member::Unnamed(_i)=>{ self.value = _i.index.to_string();}
            }
    }

// //////////////////////////Expressions/////////////////////////////////////

    fn visit_expr(&mut self, node: &'ast Expr){

        match node {
            Expr::Array(_e)=>{
                self.nodeType = "array".to_string();
                self.visit_expr_array(_e);
            }
            Expr::Call(_e)=>{
                self.nodeType = "FunctionCall".to_string();
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
                self.nodeType = "DirectExpression".to_string();
                self.visit_expr_binary(_e);
            }
            Expr::Unary(_e)=>{
                self.nodeType = "DirectExpression".to_string();
                self.visit_expr_unary(_e);
            }
            Expr::Lit(_e)=>{
                self.nodeType = "LiteralExpression".to_string();
                self.visit_expr_lit(_e);
            }
            Expr::If(_e)=>{
                self.nodeType = "If".to_string();
                self.visit_expr_if(_e);
            }
            Expr::Assign(_e)=>{
                self.nodeType = "VariableAssignment".to_string();
                self.visit_expr_assign(_e);
            }
            Expr::Field(_e)=>{
                self.nodeType = "DotExpression".to_string();
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

                self.visit_expr_path(_e);
            }
            Expr::Macro(_m)=>{
                self.nodeType = "macro".to_string();
                self.visit_expr_macro(_m);
            }
            Expr::Block(_e)=>{
                self.nodeType = "ExpressionBlock".to_string();
                self.visit_expr_block(_e);
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

                self.visit_expr_path(_e);
            }
            Expr::Macro(_m)=>{
                self.nodeType = "macro".to_string();
                self.visit_expr_macro(_m);
            }
            _=>{}
        }
    }

    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
        let mut left = Node::default();
        let mut right = Node::default();

        left.visit_expr(&*node.left);
        self.operands.push(left);
        self.arity = String::from("2");

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
      }

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

    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        self.visit_lit(&node.lit);
    }

    fn visit_expr_path(&mut self, node: &'ast ExprPath){
        let mut nameExpression = Node::default();
        nameExpression.nodeType = "NameExpression".to_string();

        for seg in &node.path.segments{
            nameExpression.nameNode.push_str(&seg.ident.to_string());
        }
        self.nameNode.push(nameExpression);
    }

     fn visit_expr_assign(&mut self, node: &'ast ExprAssign){
         let mut right = Node::default();

         self.visit_expr(&node.left);
         right.visit_expr(&node.right);

         self.operator = "=".to_string();
         self.expression.push(right);

     }

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
                 else_body.visit_expr(_e); //TODO handle else clauses
             }
             None =>{}
         }
         self.elseBody.push(else_body);

     }
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
         let mut nameExpression = Node::default();
         nameExpression.nodeType = "NameExpression".to_string();

         for seg in &node.mac.path.segments{
             nameExpression.nameNode.push_str(&seg.ident.to_string());
         }
         self.nameNode.push(nameExpression);
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

     fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
         let mut function = Node::default();
         let mut left = Node::default();
         let mut nameExpression = Node::default();
         let mut parameters = Node::default();


         function.nodeType = "dotExpression".to_string();
         nameExpression.nodeType = "NameExpression".to_string();
         nameExpression.name = node.method.to_string();
         left.visit_expr(&node.receiver);

         function.nameNode.push(nameExpression);
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
