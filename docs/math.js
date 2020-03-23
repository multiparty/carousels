// Important docs: node types and their attributes
// https://mathjs.org/docs/expressions/expression_trees.html

// we should use math.js instead of polynomium because it supports exponentials, max, logs, sqrt, recurrances, etc
// here is the API that we will need
const math = require('mathjs');

// costs that we parse from specificiation
const cost1 = math.parse('2*x^2');
const cost2 = math.parse('x^2 + log(x, 2)');

// we manipulate the costs as we go on parsing the file
let poly1 = new math.OperatorNode('+', 'add', [cost1, cost2]);
let poly2 = new math.FunctionNode('max', [cost1, cost2]);

// we can simplify equations every now and then to keep them compact
poly1 = math.simplify(poly1);
poly2 = math.simplify(poly2);

// we can log things
console.log(poly1.toString());
console.log(poly2.toString());

// when we are ready, we can evaluate
const compiledExpr = poly1.compile();
console.log(compiledExpr.evaluate({x: 1}));

// we can add our own functions if we want
const f_n = math.parse('f(n/2) + 1'); // recurrance for binary search

// we can traverse the expression to modify or analyze it!
const isRecursive = function (name, equation) {
  let recursive = false;
  // find out if the function is recursive: i.e. if name is used in equation
  equation.traverse(function (node, path, parent) {
    if (node.type === 'FunctionNode') {
      if (node.fn.toString() === name) {
        recursive = true;
      }
    }
  });

  return recursive;
};
console.log('f(n) =', f_n.toString, ' is recursive:', isRecursive('f', f_n));


/*
 *  Define a recursive function type in mathjs
 */

function get_rec_def(recurance, conditions) {
  const fn = math.parse(recurance);
  const name = fn.name;
  const param = fn.params[0];
  const expr = fn.expr;

  const [fc, f_c] = math.parse(conditions.split('='));  // f(c)
  const c = fc.args[0];

  // Eg. f     (    n    ) = iff(    n    ,     n    >=  1  , "f(n/2)+1",    0   )
  return name+'('+param+') = iff('+param+', '+param+'>='+c+', "'+expr+'", '+f_c+')';
}

// Set up the parser
const parser = math.parser();
parser.set('iff', function (n, above_base_case, thunk_f, base_val) {
  parser.set('n', n);
  return above_base_case ? parser.evaluate(thunk_f) : base_val;
});

// g and f are supposed to be the same function
const f = parser.evaluate(get_rec_def('h(n) = h(n/2)+1', 'h(1) = 0'));
const g = parser.evaluate('g(n) = iff(n, n>=1, "g(n/2)+1", 0)');

console.log(f(8));
console.log(g(8));
