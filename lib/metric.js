var find_Scope = function(p){ // TODO: fix scoping problems with arrays
  var scope = p.scope;
  while(scope.block.id == undefined){
    scope = scope.parent;
  }
  return scope.block.id.name;
}



var createMetric = function(spec) {

  var dict = {}; // acts as a stack
  dict["arrays"] = [];

  return function () {
    var zero = math.parse('0'),  // create constant polynomial always = 0
        one  = math.parse('1'),  // create constant polynomial always = 1
        sum = function () { return new math.OperatorNode('+', 'add', Array.from(arguments)); },
        dot = function () { return new math.OperatorNode('*', 'multiply', Array.from(arguments)); },
        max = function () { return new math.FunctionNode('max', Array.from(arguments)); },
        binsum = function (a, b) { return sum(a, b); },
        bindot = function (a, b) { return dot(a, b); },
        binmax = function (a, b) { return max(a, b); }
        ;

    return carousels.babelVisitorDefaults({
      visitor: {
        Program: {
          "exit": function (p) {

            var results = {}, metric = {};
            for (var i = 0; i < p.node.body.length; i++) {
              metric[p.node.body[i].id.name] = p.node.body[i].metric;
              results[p.node.body[i].id.name] = math.simplify(p.node.body[i].metric).toString();
            }
            p.node.metric = metric;
            p.node.results = results;
          }
        },
        ExpressionStatement: {
          "exit": function (p) {
            p.node.metric = p.node.expression.metric;
          }
        },
        CallExpression: {
          "exit": function (p) {
            var op_name =  (p.node.callee.property != undefined)?  p.node.callee.property.name : p.node.callee.name ;
            var parent_type = p.parent.type;
            var scope = find_Scope(p);

            if (op_name == "map" || op_name == "reduce") {
              var arg = (p.node.arguments[0].type == "Identifier")? dict[scope+ ": "+p.node.arguments[0].name]: p.node.arguments[0];
              var func = (p.node.arguments[1].type == "Identifier")?  dict[p.node.arguments[1].name]: p.node.arguments[1];
              var arr_length = (op_name == "map") ? arg.elements.length : arg.elements.length - 1;
              var decorator = "$";  // Dynamic array variable name
              var length_poly = (
                                  (p.node.arguments[0].type === "Identifier")
                                  && p.node.arguments[0].name[0] === decorator
                                  && $('#dynamic').is(':checked')
                                )
                                ? math.parse('b')
                                : math.parse(arr_length)
                                ;
              p.node.metric = sum(dot(length_poly, func.metric), arg.metric);
            } else if (op_name in spec) {
              var arguments = p.node.arguments;
              arguments = arguments.map(e => e.metric);
              p.node.metric = arguments.reduce(binsum, spec[op_name]);
            } else {
              throw Error("Node type CallExpression with operator " + op_name +
                          " is not handled at line " + start.line + ", column " + start.column + ".");
            }

          }
        },
        MemberExpression:{
          "exit": function (p) {
            if(p.container.arguments != undefined){
              caller_object = p.node.object;
              arguments = p.container.arguments;
              arguments.unshift(caller_object);
            } else { // if the MemberExpression is not a function call
              p.node.metric = zero;
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

            console.log('call', arr, sum, one);
            arr = arr.map(e => e.metric);
            p.node.metric = arr.reduce(binsum, zero);
            if(p.container.id!= undefined){
              dict[scope+ ": "+p.container.id.name]= p.node;
            }
          }
        },
        Identifier: {
          "exit": function (p) {
            p.node.metric = zero;
          }
        },
        BlockStatement: {
          "exit": function (p) {
            p.node.metric = p.node.body.map(e => e.metric).reduce(binsum, zero);
          }
        },
        VariableDeclaration: {
          "exit": function (p) {
            p.node.metric = p.node.declarations.map(e => e.metric).reduce(binsum, zero);
          }
        },
        VariableDeclarator: {
          "exit": function (p) {
            p.node.metric = p.node.init.metric;
          }
        },
        ReturnStatement: {
          "exit": function (p) {
            p.node.metric = p.node.argument.metric;
          }
        },
        BinaryExpression: {
          "exit": function (p) {
            var start = p.node.loc.start, op = p.node.operator;
            if (op in spec) {
              p.node.metric = [p.node.left, p.node.right].map(e => e.metric).reduce(binsum, spec[op]);
            } else {
              throw Error("Node type BinaryExpression with operator " + op +
                          " is not handled at line " + start.line + ", column " + start.column + ".");
            }
          }
        },
        NumericLiteral: {
          "exit": function (p) {
            p.node.metric = zero;
          }
        },
        AwaitExpression: {
          "exit": function (p) {
            p.node.metric = p.node.argument.metric;
          }
        },
        ForStatement: {
          "exit": function (p) {
            const loop = p.node;
            const init = loop.init;
            const test = loop.test;
            const update = loop.update;
            const body = loop.body;


            // Compute depth
            let depth;  // mathjs object - usually a constant

            // Determine this for-loop's declaration style
            const type = /*check*/ 'counterloop';

            if (type === 'counterloop') {
              const start = init.declarations[0].init.value;
              const end = test.right.value;
              const inc = update.operator == '++' ? 1
                        : update.operator == '--' ? -1
                        : update.operator == '-=' ? -1 * update.right.value
                        : update.right.value;

              const cst_bound = math.parse(Math.floor((end-start)/inc));
              const var_bound = math.parse('b');
              depth = cst_bound;
            }

            if (type === 'elementin') {
              // Support this?
            }

            if (type === 'elementof') {
              // Support this?
            }

            // Total cost
            let weight = sum(
              body.metric,
              init.metric,
              test.metric,
              update.metric
            );

            p.node.metric = dot(depth, weight);
          }
        },
        IfStatement: {
          "exit": function (p) {
            var else_branch = p.node.alternate;
            var if_branch = p.node.consequent;
              max(if_branch.metric, else_branch.metric).toString());
            p.node.metric = max(if_branch.metric, else_branch.metric);
          }
        },
      }
    });
  };
}
