/* global math, currentOutput, Plotly */
const [parse, evaluate] = pbnj(math);

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
  const y = evaluate(func, parse(context));
  const xTrace = [], yTrace = [];
  for (let x = start; x <= end; x++) {
    xTrace.push(x);
    yTrace.push(y(x));
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
