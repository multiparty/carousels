module.exports = function (mathjs) {
  // constants
  const ZERO = mathjs.parse('0');
  const ONE = mathjs.parse('1');
  const TRUE = mathjs.parse('true');
  const ERROR = mathjs.parse('__error()');

  // functions used to create symbolic expressions (e.g. x + y)
  const not = function (argument) {
    return new mathjs.OperatorNode('not', 'not', [argument]);
  };
  const unaryMinus = function (argument) {
    return new mathjs.OperatorNode('-', 'unaryMinus', [argument]);
  };

  // generic operator Node
  const genericOperator = function (operator, description, identity) {
    const emptyArgs = function (_arguments) {
      return _arguments.length === 0 || _arguments[0] == null;
    };
    const operatorFunctor = function () {
      if (emptyArgs(arguments)) {
        if (identity === undefined) {
          throw new Error('Mathjs operator "' + operator + '" has no identity and is called without arguments!');
        }
        return identity;
      }
      if (arguments.length === 1) {
        return arguments[0];
      }
      return new mathjs.OperatorNode(operator, description, Array.from(arguments));
    };
    return operatorFunctor;
  };

  // integer division with floor and ceil
  const div = function (x, y) {
    const div = new mathjs.OperatorNode('/', 'divide', [x, y]);
    return new mathjs.FunctionNode('floor', [div]);
  };
  const ceilDiv = function (x, y) {
    const div = new mathjs.OperatorNode('/', 'divide', [x, y]);
    return new mathjs.FunctionNode('ceil', [div]);
  };

  const max = function () {
    const emptyArgs = function (_arguments) {
      return _arguments.length === 0 || _arguments[0] == null;
    };

    if (emptyArgs(arguments)) {
      return ZERO;
    }
    if (arguments.length === 1) {
      return arguments[0];
    }
    return new mathjs.FunctionNode('max', Array.from(arguments));
  };

  const iff = function (condition, ifVal, elseVal) {
    return new mathjs.FunctionNode('iff', [condition, ifVal, elseVal]);
  };

  // expose functions
  return {
    constants: {
      ZERO: ZERO,
      ONE: ONE,
      TRUE: TRUE,
      ERROR: ERROR
    },
    genericOperator: genericOperator,
    functions: {
      max: max,
      iff: iff
    },
    customOperators: {
      not: not,
      unaryMinus: unaryMinus,
      div: div,
      ceilDiv: ceilDiv
    }
  };
};