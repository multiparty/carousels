var find_Scope = function(p){ // TODO: fix scoping problems with arrays
  var scope = p.scope;
  while(scope.block.id == undefined){
    scope = scope.parent;
  }
  return scope.block.id.name;
}


//TODO make a type-map function that takes babel/javascript type field and syncs it with
// the rust AST type fieldkl

var createMetric = function(spec) {

  var dict = {}; // acts as a stack
  dict["arrays"] = [];

  return function () {
    var zero = polynomium.c(0).toObject(), //create constant polynomium = 0
        one = polynomium.c(1).toObject(), //create constant polynomium = 1
        plus = function (sum, node) { return polynomium.add(sum, node.metric).toObject(); },
        dot = function (mult, node) { return polynomium.mul(mult, node.metric).toObject(); }
        ;

    return carousels.babelVisitorDefaults({
      visitor: {
        Program: {
          "exit": function (p) {

            var results = {}, metric = {};
            var IR = { 'id': "",
                        'typ': "",
                        'value': 'File',
                        'context': '',
                        'parent': '',
                        'children': []
            };
            for (var i = 0; i < p.node.body.length; i++) {
              metric[p.node.body[i].id.name] = p.node.body[i].metric;
              results[p.node.body[i].id.name] = polynomium.toString(p.node.body[i].metric);
            }
            p.node.metric = metric;
            p.node.results = results;
            p.node.IR = IR;
            console.log(p.node.type);
          }
        },
        ExpressionStatement: {
          "exit": function (p) {
            p.node.metric = p.node.expression.metric;
            console.log('expr statement:', p);
          }
        },
        CallExpression: {
          "exit": function (p) {
            var op_name =  (p.node.callee.property != undefined)?  p.node.callee.property.name : p.node.callee.name ;
            var parent_type = p.parent.type;
            var scope = find_Scope(p);


            if(op_name == "map" || op_name == "reduce"){
              var arg = (p.node.arguments[0].type == "Identifier")? dict[scope+ ": "+p.node.arguments[0].name]: p.node.arguments[0];
              var func = (p.node.arguments[1].type == "Identifier")?  dict[p.node.arguments[1].name]: p.node.arguments[1];
              var arr_length = (op_name == "map") ? arg.elements.length : arg.elements.length - 1;

              p.node.metric = polynomium.add(dot(polynomium.c(arr_length).toObject(), func), arg.metric).toObject();
            }else if (op_name in spec) {
              var arguments = p.node.arguments;
              p.node.metric = arguments.reduce(plus, spec[op_name]);
            }else {
              throw Error("Node type CallExpression with operator " + op_name +
                          " is not handled at line " + start.line + ", column " + start.column + ".");
            }

            console.log('call expr', p.node);
            p.node.IR = {
              "id": p.node.name,
              "typ": "CallExpression",
              "value": "",
              "context": "",
              "parent": "",
              "children": []
            }
          }
        },
        MemberExpression:{
          "exit": function (p) {
            if(p.container.arguments != undefined){
              caller_object = p.node.object;
              arguments = p.container.arguments;
              arguments.unshift(caller_object);
            }else{ // if the MemberExpression is not a function call
              p.node.metric = 0;
            }

            p.node.IR = {
              "id": p.node.name,
              "typ": "MemberExpression",
              "value": "",
              "context": "",
              "parent": "",
              "children": []
            }
          }
        },
        UpdateExpression: {
          "exit": function(p){
            p.node.metric = zero;
          }
        },
        ArrowFunctionExpression: {
          "exit": function(p){
            var op_name = p.node.body.callee.property.name;
            p.node.metric = p.container[1].body.metric;
          }
        },
        AssignmentExpression: {
          "exit": function(p){
            p.node.metric = p.node.right.metric;
            console.log('assignment', p.node);
          }
        },
        IfStatement: { // WARNING: OVERESTIMATE Cost = Cost_IF + Cost_Else
          "exit": function(p){
            console.log(p);
            var else_branch = p.node.alternate;
            var if_branch = p.node.consequent;
            // TODO change this to be the max of if.metric and else.metric
            // not sure what .metric looks like here or if polynomium has a max function
            p.node.metric = polynomium.add(if_branch.metric, else_branch.metric).toObject();
          }
        },
        FunctionDeclaration: {
          "exit": function (p) {
            p.node.metric = p.node.body.metric;
            dict[p.node.id.name] = p.node;
          }
        },
        FunctionExpression: {
          "exit": function (p) {
            p.node.metric = p.node.body.metric;
            dict[p.node.id.name] = p.node;
          }
        },
        ArrayExpression: { // TODO: fix issue with arrays defined in anonymous functions being added to primary function stack
          "exit": function (p) {
            var arr = p.node.elements;
            var scope = p.scope.block.id.name;

            p.node.metric = arr.reduce(plus);
            if(p.container.id!= undefined){
              dict[scope+ ": "+p.container.id.name]= p.node;
            }
            p.node.IR = {
              "id": "",
              "typ": "ArrayExpr",
              "value": "",
              "context": "",
              "parent": "",
              "children": []
            };
            for (var i = 0; i < p.node.elements.length; i++) {

              p.node.IR.children.push(p.node.elements[i]);
            }
          }
        },
        Identifier: {
          "exit": function (p) {
            p.node.metric = zero;
            p.node.IR = {
              "id": p.node.name,
              "typ": "Identifier",
              "value": "",
              "context": "",
              "parent": "",
              "children": []
            }

          }
        },
        BlockStatement: {
          "exit": function (p) {
            p.node.metric = p.node.body.reduce(plus, zero);
            p.node.IR = {
              "id": p.node.name,
              "typ": "BlockStmt",
              "value": "",
              "context": "",
              "parent": "",
              "children": []
            }
          }
        },
        VariableDeclaration: {
          "exit": function (p) {
            //console.log('DeclaraTION', p.node);
            p.node.metric = p.node.declarations.reduce(plus, zero);
            p.node.IR = {
              "id": "",
              "typ": "Let",
              "value": "",
              "context": "",
              "parent": "",
              "children": [p.node.declarations[0].id.IR, p.node.declarations[0].init.IR]
            }
            console.log('declaration', p.node);
          }
        },
        VariableDeclarator: {
          "exit": function (p) {
            //console.log('declaraTOR', p.node);
            console.log('declarator', p.node);
            p.node.metric = p.node.init.metric;
          }
        },
        ReturnStatement: {
          "exit": function (p) {
            p.node.IR= {
              "id": "",
              "typ": "Return",
              "value": "",
              "context": "",
              "parent": "",
              "children": []
            };
            p.node.metric = p.node.argument.metric;
            p.node.argument.IR.parent = "Return";
            p.node.argument.IR.parent = "Returnee";
            p.node.IR.children = [p.node.argument.IR];
            console.log("return", p.node);
          }
        },
        BinaryExpression: {
          "exit": function (p) {
            var start = p.node.loc.start, op = p.node.operator;
            p.node.IR =
            {
              "id": "",
              "typ": "Binary Expr",
              "value": "+",
              "context": "",
              "parent": "",
              "children": [p.node.left.IR, p.node.right.IR]
            }
              p.node.left.IR.parent = "Binary Expr";
              p.node.left.IR.context = "Left";
              p.node.right.IR.parent = "Binary Expr";
              p.node.right.IR.context = "Right";
            console.log("BinExp", p.node);
            if (op in spec) {
              p.node.metric = [p.node.left, p.node.right].reduce(plus, spec[op]);
            } else {
              throw Error("Node type BinaryExpression with operator " + op +
                          " is not handled at line " + start.line + ", column " + start.column + ".");
            }
          }
        },
        NumericLiteral: {
          "exit": function (p) {
            p.node.IR = {
                  "id": "",
                  "typ": "Literal",
                  "value": p.node.value,
                  "context": "",
                  "parent": "",
                  "children": []
                };
            p.node.metric = zero;
          }
        }
      }
    });
  };
}
