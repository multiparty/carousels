/* global math, currentOutput, Plotly */
const mathjs = math;

const evaluate = function (context, expression) {
  // Set up the parser with lazy evaluation and safe recursion
  const parser = mathjs.parser();
  parser.set('iff', function (n, above_base_case, thunk_f, base_val) {
    parser.set('n0', n); // figure out a generic way to set this
    return above_base_case ? parser.evaluate(thunk_f) : base_val;
  });

  if (Array.isArray(context)) {
    // Load all relevant functions into parser
    for (let c = 0; c < context.length; c++) {
      parser.evaluate(context[c]);
    }
  } else {
    parser.scope = context;
  }

  return {
    value: parser.evaluate(expression),
    context: parser.getAll()
  };
};

const get_rec_def = function (recurance, conditions) {
  const fn = mathjs.parse(recurance);
  const name = fn.name;
  const param = fn.params[0];
  const expr = fn.expr;

  const [fc, f_c] = mathjs.parse(conditions.split('='));  // f(c)
  const c = fc.args[0];

  // Eg. f     (    n    ) = iff(    n    ,     n    >=  1  , "f(n/2)+1",    0   )
  return name+'('+param+') = iff('+param+', '+param+'>='+c+', "'+expr+'", '+f_c+')';
};
const test_evaluate = function () {
  // g and f are the same function
  const def_f = get_rec_def('f(n) = f(n/2)+1', 'f(1) = 0');
  const def_g = 'g(n) = iff(n, n>=1, "g(n / 2) + 1", 0)';
  const f_8 = evaluate([def_f, def_g], 'g(8)').value;
  console.log(f_8);
};

const plotFunc = function (parameters, func, start, end, div) {
  const functions = currentOutput.functions;
  // build context
  let context = [];
  for (let f in functions) {
    context.push(functions[f]);
  }
  for (let p in parameters) {
    context.push(p + ' = ' + parameters[p]);
  }

  // start evaluating
  const xTrace = [],
    yTrace = [];
  for (let x = start; x <= end; x++) {
    xTrace.push(x);

    const result = evaluate(context, func +'(' + x + ')');
    yTrace.push(result.value);
    context = result.context;
  }

  // sliders
  const steps5 = [];
  const steps32 = [];
  for (let i = 1; i < 33; i++) {
    if (i <= 5) {
      steps5.push({
        label: i,
        method: 'restyle',
        args: []
      });
    }
    steps32.push({
      label: i,
      method: 'restyle',
      args: []
    })
  }

  Plotly.newPlot(div, [{
    x: xTrace,
    y: yTrace,
    type: 'scatter',
    name: 'merge_sort'
  }], {
    title: 'merge_sort plot',
    xaxis: {
      title: 'n0: length of variable merge_sort@slice'
    },
    yaxis: {
      title: 'Online Messages'
    },
    sliders: [
      {
        pad: {t: 75},
        currentvalue: {
          xanchor: 'left',
          prefix: 'p = ',
          font: {
            size: 20
          }
        },
        steps: steps5
      },
      {
        pad: {t: 150},
        currentvalue: {
          xanchor: 'left',
          prefix: 'b = ',
          font: {
            size: 20
          }
        },
        steps: steps32
      }
    ]
  });
};