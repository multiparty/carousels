(function(exports, node) {

  /*
  const babel = require('babel-core');
  const math = require('mathjs');
  const analysis = require('./analysis');
  const babylon = require('babylon');
  */

  const babelTypes = {"types": [
    "ArrayExpression",
    "AssignmentExpression",
    "BinaryExpression",
    "Directive",
    "DirectiveLiteral",
    "BlockStatement",
    "BreakStatement",
    "CallExpression",
    "CatchClause",
    "ConditionalExpression",
    "ContinueStatement",
    "DebuggerStatement",
    "DoWhileStatement",
    "EmptyStatement",
    "ExpressionStatement",
    "File",
    "ForInStatement",
    "ForStatement",
    "FunctionDeclaration",
    "FunctionExpression",
    "Identifier",
    "IfStatement",
    "LabeledStatement",
    "StringLiteral",
    "NumericLiteral",
    "NullLiteral",
    "BooleanLiteral",
    "RegExpLiteral",
    "LogicalExpression",
    "MemberExpression",
    "NewExpression",
    "Program",
    "ObjectExpression",
    "ObjectMethod",
    "ObjectProperty",
    "RestElement",
    "ReturnStatement",
    "SequenceExpression",
    "SwitchCase",
    "SwitchStatement",
    "ThisExpression",
    "ThrowStatement",
    "TryStatement",
    "UnaryExpression",
    "UpdateExpression",
    "VariableDeclaration",
    "VariableDeclarator",
    "WhileStatement",
    "WithStatement",
    "AssignmentPattern",
    "ArrayPattern",
    "ArrowFunctionExpression",
    "ClassBody",
    "ClassDeclaration",
    "ClassExpression",
    "ExportAllDeclaration",
    "ExportDefaultDeclaration",
    "ExportNamedDeclaration",
    "ExportSpecifier",
    "ForOfStatement",
    "ImportDeclaration",
    "ImportDefaultSpecifier",
    "ImportNamespaceSpecifier",
    "ImportSpecifier",
    "MetaProperty",
    "ClassMethod",
    "ObjectPattern",
    "SpreadElement",
    "Super",
    "TaggedTemplateExpression",
    "TemplateElement",
    "TemplateLiteral",
    "YieldExpression",
    "AnyTypeAnnotation",
    "ArrayTypeAnnotation",
    "BooleanTypeAnnotation",
    "BooleanLiteralTypeAnnotation",
    "NullLiteralTypeAnnotation",
    "ClassImplements",
    "ClassProperty",
    "DeclareClass",
    "DeclareFunction",
    "DeclareInterface",
    "DeclareModule",
    "DeclareModuleExports",
    "DeclareTypeAlias",
    "DeclareOpaqueType",
    "DeclareVariable",
    "DeclareExportDeclaration",
    "ExistentialTypeParam",
    "FunctionTypeAnnotation",
    "FunctionTypeParam",
    "GenericTypeAnnotation",
    "InterfaceExtends",
    "InterfaceDeclaration",
    "IntersectionTypeAnnotation",
    "MixedTypeAnnotation",
    "EmptyTypeAnnotation",
    "NullableTypeAnnotation",
    "NumericLiteralTypeAnnotation",
    "NumberTypeAnnotation",
    "StringLiteralTypeAnnotation",
    "StringTypeAnnotation",
    "ThisTypeAnnotation",
    "TupleTypeAnnotation",
    "TypeofTypeAnnotation",
    "TypeAlias",
    "OpaqueType",
    "TypeAnnotation",
    "TypeCastExpression",
    "TypeParameter",
    "TypeParameterDeclaration",
    "TypeParameterInstantiation",
    "ObjectTypeAnnotation",
    "ObjectTypeCallProperty",
    "ObjectTypeIndexer",
    "ObjectTypeProperty",
    "ObjectTypeSpreadProperty",
    "QualifiedTypeIdentifier",
    "UnionTypeAnnotation",
    "VoidTypeAnnotation",
    "JSXAttribute",
    "JSXClosingElement",
    "JSXElement",
    "JSXEmptyExpression",
    "JSXExpressionContainer",
    "JSXSpreadChild",
    "JSXIdentifier",
    "JSXMemberExpression",
    "JSXNamespacedName",
    "JSXOpeningElement",
    "JSXSpreadAttribute",
    "JSXText",
    "Noop",
    "ParenthesizedExpression",
    "AwaitExpression",
    "ForAwaitStatement",
    "BindExpression",
    "Import",
    "Decorator",
    "DoExpression",
    "ExportDefaultSpecifier",
    "ExportNamespaceSpecifier",
    "RestProperty",
    "SpreadProperty"
  ]};

  var babelVisitorDefaults = function (obj, makeDefaultHandler) {
    if (makeDefaultHandler == null)
    makeDefaultHandler = function (ty) {
      return function (path, state) {
        var start = path.node.loc.start;
        throw Error("Node type " + ty + " is not handled at line " + start.line + ", column " + start.column + ".");
      };
    };

    for (var i = 0; i < babelTypes.types.length; i++) {
      if (!(babelTypes.types[i] in obj.visitor)) {
        obj.visitor[babelTypes.types[i]] = makeDefaultHandler(babelTypes.types[i]);
      }
    }
    return obj;
  };

  var buildPoly = function (ast) {
    const plus = function () {
      return new math.OperatorNode('+', 'add', Array.from(arguments));
    };
    const dot = function () {
      return new math.OperatorNode('*', 'multiply', Array.from(arguments));
    };
    for (var con in ast) {
      var val = ast[con];
      if (con == "Num")
      return math.parse(parseInt(val));
      if (con == "Var")
      return math.parse(val[0]);
      if (con == "Add")
      return plus(buildPoly(val[0]), buildPoly(val[1]));
      if (con == "Mul")
      return dot(buildPoly(val[0]), buildPoly(val[1]));
      if (con == "Exp") {
        var poly = buildPoly(val[0]);
        var exp = parseInt(val[1]["Num"][0], 10);
        for(var i = 1; i < exp; i++){
          poly = dot(poly, buildPoly(val[0]));
        }
        return poly;
      }
    }
    return math.parse(0);
  };


  // Parses the cost specification, NOT the function's input.
  var parsePoly = function (str) {
    var graPolynomal = [
      {"Term": [
        {"Add": [["Factor"], "+", ["Term"]]},
        {"": [["Factor"]]}
      ]},
      {"Factor": [
        {"Mul": [["Exponant"], "*", ["Factor"]]},
        {"Mul": [["Exponant"], ["Factor"]]},
        {"": [["Exponant"]]}
      ]},
      {"Exponant": [
        {"Exp": [["Atom"], "^", ["Atom"]]},
        {"": [["Atom"]]}
      ]},
      {"Atom": [
        {"": ["(", ["Term"], ")"]},
        {"Num": [{"RegExp":"[0-9]+"}]},
        {"Var": [{"RegExp":"[a-z]"}]}
      ]}
    ];
    return buildPoly(imparse.parse(graPolynomal, str));
  };

  var analyzeCode = function (code, costDefinition) {
    var options = {plugins: [analysis]};

    const ast = babylon.parse(code, { allowReturnOutsideFunction: true });
    ast.program.costDefinition = costDefinition;

    var analyzed = babel.transformFromAst(ast, code, options);
    var costs = analyzed.ast.program.costObject;
    for (var f in costs) {
      costs[f].cost = costs[f].cost.toString();
    }
    return costs;
  }

  exports.babelVisitorDefaults = babelVisitorDefaults;
  exports.parsePoly = parsePoly;
  exports.analyzeCode = analyzeCode;

}((typeof exports == 'undefined' ? this.carousels = {} : exports), typeof exports != 'undefined'));
