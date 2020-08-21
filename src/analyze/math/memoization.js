// memoization table
let CACHE = {};

// used to reduce operands of this operation
const reducers = {
  '+': function (x, y) {
    return x + y;
  },
  '-': function (x, y) {
    return x - y;
  },
  '*': function (x, y) {
    return x * y;
  },
  '/': function (x, y) {
    return x / y;
  },
  '%': function (x, y) {
    return x % y;
  },
  'and': function (x, y) {
    return x && y;
  },
  'or': function (x, y) {
    return x || y;
  },
  '^': function (x, y) {
    return Math.pow(x, y);
  },
  '<': function (x, y) {
    return x < y;
  },
  '>': function (x, y) {
    return x > y;
  },
  '<=': function (x, y) {
    return x <= y;
  },
  '>=': function (x, y) {
    return x >= y;
  },
  '==': function (x, y) {
    return x === y;
  },
  '!=': function (x, y) {
    return x !== y;
  },
  'not': true
};

// eval an operation node whose operands are already evaluated
const evalOp = function (op, fn, operands) {
  if (reducers[op] == null) {
    throw new Error('Unsupported operator "' + op + '" in evaluation!');
  }

  operands = operands.map(function (node) {
    return node.value;
  });

  if (op === 'not') {
    return !operands[0];
  }
  if (op === '-') {
    if (fn === 'unaryMinus') {
      return -1 * operands[0];
    }
  }

  return operands.reduce(reducers[op]);
};

// evaluate a function call
const isBuiltinFunction = function (fn) {
  return ['max', 'iff', 'ceil', 'floor', 'log'].indexOf(fn) > -1;
};
const evalBuiltin = function (mathjs, node, args) {
  args = args.map(function (node) {
    return node.value;
  });

  const fn = node.fn.name;
  if (fn === 'max') {
    return new mathjs.ConstantNode(Math.max.apply(Math, args));
  }
  if (fn === 'iff') {
    if (args[0]) {
      return node.args[1];
    } else {
      return node.args[2];
    }
  }
  if (fn === 'ceil') {
    return new mathjs.ConstantNode(Math.ceil(args[0]));
  }
  if (fn === 'floor') {
    return new mathjs.ConstantNode(Math.floor(args[0]));
  }
  if (fn === 'log') {
    return new mathjs.ConstantNode(Math.floor(Math.log(args[0])/Math.log(2)));
  }
};
const evalFunc = function (fn, args, environment) {
  // functions from environment
  const funcDef = environment[fn];
  if (funcDef == null) {
    throw new Error('Undefined function "' + fn + '" encountered in evaluation!');
  }

  const callEnv = {};
  for (let i = 0; i < funcDef.params.length; i++) {
    callEnv[funcDef.params[i]] = args[i];
  }

  // return function body
  return {callEnv: callEnv, expr: funcDef.expr};
};
const makeMemoizationKey = function (node, args) {
  const fn = node.fn.name;
  return fn + '(' + args.join(',') + ')';
};

module.exports = function (mathjs, callExpression, environment, reset) {
  // reset memoization if flagged
  if (reset === true) {
    CACHE = {};
  }

  // Stack for evaluation
  const stack = [{node: callExpression}];
  const operandsStack = [[]];
  const environments = [environment];

  // Iterate until stack is empty
  while (stack.length > 0) {
    const obj = stack.pop();
    const tag = obj.tag;
    const operands = operandsStack[operandsStack.length-1];
    let val = null;

    if (tag === '--ENDCALL--') {
      // Marker signifying that a function call has been evaluated completely!
      const result = operands[operands.length-1];
      CACHE[obj.key] = result;
      environments.pop(); // destroy scope of function
      continue;
    }

    // Evaluate by node type
    const node = obj.node;
    switch (node.type) {
      // Parenthesis
      case 'ParenthesisNode':
        stack.push({node: node.content});
        break;
      // Constant is ready!
      case 'ConstantNode':
        operands.push(node);
        break;

      // Two passes: first to evaluate arguments, second to evaluate call!
      case 'FunctionNode':
        if (tag === '2ndpass') {
          operandsStack.pop();

          if (isBuiltinFunction(node.fn.name)) {
            // built in functions are evaluated directly
            stack.push({node: evalBuiltin(mathjs, node, operands)});
          } else {
            // abstractions are memoized and evaluated if uncached!
            const key = makeMemoizationKey(node, operands);
            if (CACHE[key] != null) {
              // warn about using old cache values
              let fn = node.fn.name;
              if (environment[fn] == null) {
                console.warn('Retrieving cached result ' + key + '=' + CACHE[key]
                  + ' even though "' + fn + '" is out of scope.');
              }
              // in cache
              stack.push({node: CACHE[key]});
            } else {
              // not in cache
              const res = evalFunc(node.fn.name, operands, environments[0]);
              environments.push(res.callEnv);
              stack.push({tag: '--ENDCALL--', key: key});
              stack.push({node: res.expr});
            }
          }
        } else {
          operandsStack.push([]);
          stack.push({tag: '2ndpass', node: node});
          if (node.fn.name === 'iff') {
            // lazy evaluation
            stack.push({node: node.args[0]});
          } else {
            // eager evaluation
            for (let i = node.args.length - 1; i >= 0; i--) {
              stack.push({node: node.args[i]});
            }
          }
        }
        break;

      // Two passes: first to evaluate arguments, second to evluate operator!
      case 'OperatorNode':
        if (tag === '2ndpass') {
          operandsStack.pop();
          const res = evalOp(node.op, node.fn, operands);
          stack.push({node: new mathjs.ConstantNode(res)});
        } else {
          operandsStack.push([]);
          stack.push({tag: '2ndpass', node: node});
          for (let i = node.args.length - 1; i >= 0; i--) {
            stack.push({node: node.args[i]});
          }
        }
        break;

      // Look up in the environment
      case 'SymbolNode':
        for (let i = environments.length - 1; i >= 0; i--) {
          val = environments[i][node.name];
          if (val != null) {
            break;
          }
        }
        if (val == null) {
          throw new Error('Undefined variable "' + node.name + '" in evaluation!');
        }
        stack.push({node: val});
        break;

      // Arrays: Two passes: first schedules all elements for evaluation, second combines them as arrays
      case 'ArrayNode':
        if (tag === '2ndpass' || node.__ready) {
          if (tag === '2ndpass') {
            operandsStack.pop();
          }

          if (node.__ready) {
            val = node;
          } else {
            val = new mathjs.ArrayNode(operands);
            val.__ready = true;
          }
          operandsStack[operandsStack.length - 1].push(val);
        } else {
          operandsStack.push([]);
          stack.push({tag: '2ndpass', node: node});
          for (let i = node.items.length - 1; i >= 0; i--) {
            stack.push({node: node.items[i]});
          }
        }
        break;

      // Arrays Access: single pass is enough, we only support literal indices, so they do not need evaluation
      // we do not need to evaluate the array, if it is already in array form, only the element accessed directly (lazy)
      // otherwise (if it is a function call essentially), we will have to evaluate all of it (not so lazy), which requires 2 passes
      case 'AccessorNode':
        // math js indices start at 1 for some reason
        if (node.object.type === 'ArrayNode') {
          stack.push({node: node.object.items[node.index.dimensions[0].value - 1]});
        } else {
          if (tag === '2ndpass') {
            operandsStack.pop();
            stack.push({node: operands[0].items[node.index.dimensions[0].value - 1]});
          } else {
            operandsStack.push([]);
            stack.push({tag: '2ndpass', node: node});
            stack.push({node: node.object});
          }
        }
        break;

      // Error: unsupported!
      default:
        throw new Error('Unsupported node "' + node.type + '" in evaluation!');
    }
  }

  const finalVal = operandsStack.pop().pop();
  if (finalVal.type === 'ConstantNode') {
    return finalVal.value;
  } else if (finalVal.type === 'ArrayNode') {
    return finalVal.items.map(function (node) {
      return node.value;
    });
  }
};
