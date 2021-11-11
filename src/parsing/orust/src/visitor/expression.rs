use syn::visit::{Visit};
use syn::{Lit, Expr, Member, ExprAssign, ExprMethodCall,
    ExprBinary, ExprAssignOp, ExprForLoop, ExprLit, ExprCall, ExprClosure, ExprUnary, ExprReturn, ExprRange, ExprParen,
    ExprIf, ExprArray, ExprField, ExprIndex, ExprPath, BinOp, UnOp, ReturnType, ExprBreak, ExprContinue, ExprMacro};

use crate::ir::{ReturnStatement, ForEach, VariableAssignment, If, OblivIf, LiteralExpression, NameExpression,
                DirectExpression, ParenthesesExpression, ArrayAccess, RangeExpression, SliceExpression,
                ArrayExpression, FunctionCall, DotExpression, Closure, TypeNode, Break, Continue, CarouselsAnnotation};

use crate::visitor::stack::{Stack};

impl Stack{
    fn my_visit_expr_if<'ast>(&mut self, node: &'ast ExprIf, obliv: bool){

        let condition = Stack::my_visit_expr(&node.cond);

        let mut if_body =  Vec::new();
        for stmt in &node.then_branch.stmts {
            if_body.push(Stack::my_visit_stmts(stmt));
        }

        let mut _else_body = Vec::new();
        match &node.else_branch{
            Some(_else)=>{
                match &*_else.1{
                    Expr::Block(_b)=>{
                        for stmt in &_b.block.stmts {
                           _else_body.push(Stack::my_visit_stmts(stmt));
                        }
                    }
                    Expr::If(_if)=>{
                        let mut stack = Stack{visitor: Vec::new()};
                        stack.my_visit_expr_if(&_if, obliv);
                        match stack.visitor.pop(){
                            Some(_s)=>{
                               _else_body.push(_s);
                            }
                            None =>{
                                panic!("this is a terrible mistake!");
                            }
                        }
                    }
                    _=>{
                        panic!("this is a terrible mistake!");
                    }
                }
            }
            None =>{
            }
        }


        if obliv == true {
           self.visitor.push(Box::new(OblivIf::new(condition, if_body,Some(_else_body))));
        }
        else{
           self.visitor.push(Box::new(If::new(condition, if_body, Some(_else_body))));
        }

    }
}

impl <'ast> Visit <'ast> for Stack{
    fn visit_expr_binary(&mut self, node: &'ast ExprBinary) {
        let mut direct_expr = DirectExpression::new(String::from(""), 2, Vec::new());
        let left = Stack::my_visit_expr(&node.left);
        let right = Stack::my_visit_expr(&node.right);
        direct_expr.operands.push(left);
        direct_expr.operands.push(right);

        match &node.op{
            BinOp::Add(_op) => {direct_expr.operator = "+".to_string();}
            BinOp::Sub(_op) => {direct_expr.operator = "-".to_string();}
            BinOp::Mul(_op) => {direct_expr.operator = "*".to_string();}
            BinOp::Div(_op) => {direct_expr.operator = "/".to_string();}
            BinOp::Rem(_op) => {direct_expr.operator = "%".to_string();}
            BinOp::And(_op) => {direct_expr.operator = "&&".to_string();}
            BinOp::Or(_op) => {direct_expr.operator = "||".to_string();}
            BinOp::BitXor(_op) => {direct_expr.operator = "^".to_string();}
            BinOp::BitAnd(_op) => {direct_expr.operator = "&".to_string();}
            BinOp::BitOr(_op) => {direct_expr.operator = "|".to_string();}
            BinOp::Shl(_op) => {direct_expr.operator = "<<".to_string();}
            BinOp::Shr(_op) => {direct_expr.operator = ">>".to_string();}
            BinOp::Eq(_op) => {direct_expr.operator = "==".to_string();}
            BinOp::Lt(_op) => {direct_expr.operator = "<".to_string();}
            BinOp::Le(_op) => {direct_expr.operator = "<=".to_string();}
            BinOp::Ne(_op) => {direct_expr.operator = "!=".to_string();}
            BinOp::Ge(_op) => {direct_expr.operator = ">=".to_string();}
            BinOp::Gt(_op) => {direct_expr.operator = ">".to_string();}
            _=>{} // Implement other operators if necessary
        }
        self.visitor.push(Box::new(direct_expr));
    }
    fn visit_expr_assign_op(&mut self, node: &'ast ExprAssignOp){
        let mut direct_expr = DirectExpression::new(String::from(""), 2, Vec::new());
        let left = Stack::my_visit_expr(&node.left);
        let right = Stack::my_visit_expr(&node.right);
        direct_expr.operands.push(left);
        direct_expr.operands.push(right);

        match &node.op{
            BinOp::AddEq(_op) => {direct_expr.operator = "+".to_string();}
            BinOp::SubEq(_op) => {direct_expr.operator = "-".to_string();}
            BinOp::MulEq(_op) => {direct_expr.operator = "*".to_string();}
            BinOp::DivEq(_op) => {direct_expr.operator = "/".to_string();}
            BinOp::RemEq(_op) => {direct_expr.operator = "%".to_string();}
            BinOp::BitXorEq(_op) => {direct_expr.operator = "&".to_string();}
            BinOp::BitAndEq(_op) => {direct_expr.operator = "^".to_string();}
            BinOp::BitOrEq(_op) => {direct_expr.operator = "|".to_string();}
            _=>{}
        }

        self.visitor.push(Box::new(VariableAssignment::new(Stack::my_visit_expr(&node.left), Box::new(direct_expr))));
    }
    //
    fn visit_expr_unary(&mut self, node: &'ast ExprUnary){
        let mut direct_expr = DirectExpression::new(String::from(""), 1, Vec::new());
        match node.op{
            UnOp::Not(_un)=>{direct_expr.operator = "!".to_string();}
            UnOp::Neg(_un)=>{direct_expr.operator = "~".to_string();}
            UnOp::Deref(_un)=>{direct_expr.operator = "*".to_string();}
        }

        direct_expr.operands.push(Stack::my_visit_expr(&node.expr));
        self.visitor.push(Box::new(direct_expr));
    }

    fn visit_expr_lit(&mut self, node: &'ast ExprLit){
        let mut literal_expr = LiteralExpression::new(String::from(""),String::from(""));

        match &node.lit{
           Lit::Str(_s)=>{
               literal_expr.type_ = String::from("str");
               literal_expr.value = _s.value();
           }
           Lit::ByteStr (_bs)=>{
               literal_expr.type_= String::from("byteStr");
               literal_expr.value = format!("{:#?}",_bs.value());
           }
           Lit::Byte (_b)=>{
               literal_expr.type_ = String::from("byte");
               literal_expr.value = _b.value().to_string();
           }
           Lit::Char(_ch) =>{
               literal_expr.type_= String::from("char");
               literal_expr.value  = _ch.value().to_string();
           }
           Lit::Int(_i)=>{
               literal_expr.type_ = String::from("number");
               literal_expr.value = _i.base10_digits().to_string();
           }
           Lit::Float(_f) =>{
               literal_expr.type_ = String::from("float");
               literal_expr.value = _f.base10_digits().to_string();
           }
           Lit::Bool(_bo)=>{
               literal_expr.type_ = String::from("bool");
               literal_expr.value = _bo.value.to_string();
           }
           Lit::Verbatim(_v)=>{
               literal_expr.type_ = String::from("any");
               literal_expr.value = _v.to_string();
           }
        }
        self.visitor.push(Box::new(literal_expr));
    }

    fn visit_expr_path(&mut self, node: &'ast ExprPath){
        let mut name_expr = NameExpression::new(String::from(""));
        for seg in &node.path.segments{
            name_expr.name.push_str(&seg.ident.to_string());
            name_expr.name.push_str("::");
        }
        name_expr.name.pop();
        name_expr.name.pop();
        self.visitor.push(Box::new(name_expr));
    }

     fn visit_expr_assign(&mut self, node: &'ast ExprAssign){

         let left = Stack::my_visit_expr(&node.left);
         let expr = Stack::my_visit_expr(&node.right);
         let assignment = VariableAssignment::new(left, expr);

         self.visitor.push(Box::new(assignment));
     }
     fn visit_expr_call(&mut self, node: &'ast ExprCall){

         let function = Stack::my_visit_expr(&node.func);
         let mut function_call = FunctionCall::new(function, Vec::new());
        for a in &node.args{
            let argument = Stack::my_visit_expr(a);
            function_call.parameters.push(argument);
        }
        self.visitor.push(Box::new(function_call));
     }
     //
     fn visit_expr_array(&mut self, node: &'ast ExprArray){

         let mut array_expr = ArrayExpression::new(Vec::new());
         for e in &node.elems{
             array_expr.elements.push(Stack::my_visit_expr(e));
         }
         self.visitor.push(Box::new(array_expr));
     }
     //
     fn visit_expr_index(&mut self, node: &'ast ExprIndex){
         let array = Stack::my_visit_expr(&node.expr);
         let range =Stack::my_visit_expr(&node.index);

         match &*node.index{
             Expr::Range(_r)=>{
                 let slice_expr = SliceExpression::new(array, range);
                 self.visitor.push(Box::new(slice_expr));
             }
             _=>{
                 let array_acces = ArrayAccess::new(array, range);
                 self.visitor.push(Box::new(array_acces));
             }
         }
     }
     //
     fn visit_expr_if(&mut self, node: &'ast ExprIf){
         let mut obliv = false;
         for att in &node.attrs{
             for seg in &att.path.segments{
                 if &seg.ident.to_string() == "__carouselsobliv__" {
                     obliv = true
                 };
             }
         }
         self.my_visit_expr_if(node, obliv);
     }
     fn visit_expr_return(&mut self, node: &'ast ExprReturn){
         match &node.expr{
             Some(_e)=>{
                let expr = Stack::my_visit_expr(&_e);
                let return_expr = ReturnStatement::new(expr);
                self.visitor.push(Box::new(return_expr));
             }
             None =>{}
         }
     }
     //
     fn visit_expr_paren(&mut self, node: &'ast ExprParen){
         let expr = Stack::my_visit_expr(&node.expr);
         let paren_expr = ParenthesesExpression::new(expr);
         self.visitor.push(Box::new(paren_expr));
     }

     fn visit_expr_for_loop(&mut self, node: &'ast ExprForLoop){
         let iterator = Stack::my_visit_pat(&node.pat);
         let range = Stack::my_visit_expr(&node.expr);

         let mut for_each = ForEach::new(iterator, range, Vec::new());
         for s in &node.body.stmts {
             for_each.body.push(Stack::my_visit_stmts(s)); // call visit_stmt on each statement in the fn body
         }
         self.visitor.push(Box::new(for_each));
     }
     //
     fn visit_expr_range(&mut self, node: &'ast ExprRange){// include a limit param
         let mut range_expr = RangeExpression::new(None, None, None);
         match &node.from{
             Some(_f) =>{
                 range_expr.start = Some(Stack::my_visit_expr(_f));
             }
             None =>{}
         }

         match &node.to{
             Some(_t) =>{
                 range_expr.end = Some(Stack::my_visit_expr(_t));
             }
             None =>{}
         }
         self.visitor.push(Box::new(range_expr));
     }
     //
     fn visit_expr_method_call(&mut self, node: &'ast ExprMethodCall){
         let right = NameExpression::new(node.method.to_string());
         let left = Stack::my_visit_expr(&node.receiver);
         let dot_expr = DotExpression::new(left, Box::new(right));

         let mut function_call = FunctionCall::new(Box::new(dot_expr), Vec::new());

         for p in node.args.iter(){
             function_call.parameters.push(Stack::my_visit_expr(p));
         }
         self.visitor.push(Box::new(function_call));
     }
     //
     fn visit_expr_field(&mut self, node: &'ast ExprField){
         let left = Stack::my_visit_expr(&node.base);

         match &node.member{
             Member::Named(_n)=>{
                 let right = NameExpression::new(_n.to_string());
                 let dot_expr = DotExpression::new(left, Box::new(right));
                 self.visitor.push(Box::new(dot_expr));
             }
             Member::Unnamed(_u)=>{
                 let right = LiteralExpression::new(_u.index.to_string(), "number".to_string());
                 let dot_expr = DotExpression::new(left, Box::new(right));
                 self.visitor.push(Box::new(dot_expr));
             }
         }

     }

     fn visit_expr_closure(&mut self, node: &'ast ExprClosure){

        let mut parameters = Vec::new();
        for p in &node.inputs{
            let variable = Stack::my_visit_pat(p);
            parameters.push(variable);
        }

        let body =  Stack::my_visit_expr(&node.body);

        let mut ty = TypeNode::new(false, String::from(""),None);
        match &node.output{
            ReturnType::Type(_ , _t)=>{
                ty.my_visit_type(_t);
            }
            _=>{}
        }

        let closure = Closure::new(parameters, body, ty);
        self.visitor.push(Box::new(closure));
     }

     fn visit_expr_break(&mut self, _node: &'ast ExprBreak){
         let break_token = Break::new(String::from("break"));
         self.visitor.push(Box::new(break_token));
     }

     fn visit_expr_continue(&mut self, _node: &'ast ExprContinue){
         let continue_token = Continue::new(String::from("continue"));
         self.visitor.push(Box::new(continue_token));
     }

     fn visit_expr_macro(&mut self, node: &'ast ExprMacro){
         let seg = &node.mac.path.segments.first();
         match seg{
             Some(_s) =>{
                 if _s.ident.to_string() == "carousels"{
                     let token_str = node.mac.tokens.to_string();
                     self.visitor.push(Box::new(CarouselsAnnotation::new(token_str)));
                 }
             }
             None =>{}
         }
     }
}
