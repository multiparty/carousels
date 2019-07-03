var createMetric = function(spec) {

  var onlineRounds = costs.onlineRounds_jiff;
  return function () {
    var zero = polynomium.c(0).toObject(), //create constant polynomium = 0
        one = polynomium.c(1).toObject(), //create constant polynomium = 1
        plus = function (sum, node) { return polynomium.add(sum, node.metric).toObject(); }, // add two polynomials
        dot = function (mult, node) { return polynomium.mul(mult, node.metric).toObject(); } // multiply two polynomials
        ;

    return carousels.babelVisitorDefaults({
      visitor: {
        Program: {
          "exit": function (p) {

            var results = {}, metric = {};
            for (var i = 0; i < p.node.body.length; i++) {
              metric[p.node.body[i].id.name] = p.node.body[i].metric;
              results[p.node.body[i].id.name] = polynomium.toString(p.node.body[i].metric);
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

            // checks if CallExpression was invoked by MemberExpression or not
            var op_name = (p.node.callee.name != undefined) ? p.node.callee.name : p.node.callee.property.name;
            var start = p.node.loc.start;
            var arguments = p.node.arguments;

            if (op_name in spec) {
              p.node.metric = arguments.reduce(plus, spec[op_name]);
            } else {
              throw Error("Node type CallExpression with operator " + op_name +
                          " is not handled at line " + start.line + ", column " + start.column + ".");
            }
          }
        },
        MemberExpression:{
          "exit": function (p) {
            caller_object = p.node.object;
            arguments = p.container.arguments;
            arguments.unshift(caller_object);

          }
        },
        FunctionDeclaration: {
          "exit": function (p) {
            p.node.metric = p.node.body.metric;
          }
        },
        Identifier: {
          "exit": function (p) {
            p.node.metric = zero;
          }
        },
        BlockStatement: {
          "exit": function (p) {
            p.node.metric = p.node.body.reduce(plus, zero);
          }
        },
        VariableDeclaration: {
          "exit": function (p) {
            p.node.metric = p.node.declarations.reduce(plus, zero);
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
              p.node.metric = [p.node.left, p.node.right].reduce(plus, spec[op]);
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
        }
      }
    });
  };
}
