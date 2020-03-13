/* Memoized ternary if else */
var mem = {};
const iff = function (args, _, scope) {
  const memotag = args.map(String).join('')+JSON.stringify(scope);
  let memo = mem[memotag];
  if (memo === undefined) {
    const [above_base_case, f, base_val] = args;

    // iff base condition not met, recurse, else, stop
    memo = above_base_case.evaluate(scope) ? f.evaluate(scope) : base_val.evaluate(scope);

    mem[memotag] = memo;
  }
  return memo;
}; iff.rawArgs = true;

/* parse by name mathjs */
const pbnj = function (mathjs) {
  mathjs.import({'iff': iff});  // Load the lazily evaluated definition

  /* Create custom math.js parser */
  const Parser = function (context) {
    const parser = mathjs.parser();

    if (context != null) {
      parser.scope = context;
    }

    const preparse = function (def) {
      return def;
    };

    parser.parse = function () {
      return parser.evaluate(preparse.apply(this, arguments));
    }.bind(this);

    return parser;
  }

  /* Expand context */
  const parse = function (definitions, context) {
    const parser = Parser(context);

    if (Array.isArray(definitions) === false) {
      parser.parse(definitions);
    } else {
      definitions.forEach(function (def) {
        parser.parse(def);
      });
    }

    return parser.getAll();
  }

  /* Evaluate expression in context */
  const evaluate = function (expression, context) {
    const parser = Parser(context);

    let value;
    if (Array.isArray(expression) === false) {
      value = parser.evaluate(expression);
    } else {
      value = expression.map(e => parser.evaluate(e));
    }

    return value;
  }

  return [parse, evaluate];
};
