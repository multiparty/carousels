const memoizedEvaluator = require('./memoization.js');

module.exports = function (mathjs) {
  /* Interpreter for a lazy ternary if */
  const iffInterpreter = function (args, _, scope) {
    const condition = args[0];
    const _if = args[1];
    const _else = args[2];
    return condition.evaluate(scope) ? _if.evaluate(scope) : _else.evaluate(scope);
  };
  iffInterpreter.rawArgs = true;

  // Load the lazy evaluation definition
  mathjs.import({iff: iffInterpreter});

  /* Evaluate expression in context */
  const evaluate = function (callExpression, context, reset) {
    const environment = {};

    // parse context into an environment
    context.forEach(function (c) {
      if (c.trim().length === 0) {
        return;
      }

      // c is either 'var = value' or 'func(params) = expr'
      // i.e. either 'AssignmentNode' or 'FunctionAssignmentNode'
      const parsed = mathjs.parse(c);
      if (parsed.isAssignmentNode) {
        environment[parsed.object.name] = parsed.value;
      } else if (parsed.isFunctionAssignmentNode) {
        environment[parsed.name] = parsed;
      } else {
        throw new Error('Unexpected statement in scope: "' + c + '" of type "' + parsed.type + '"!');
      }
    });

    return memoizedEvaluator(mathjs, mathjs.parse(callExpression), environment, reset);
  };

  return evaluate;
};