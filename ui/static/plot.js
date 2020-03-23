/* global Plotly, carouselsOutput*/
let carouselsPlot = {};

(function () {
  let topMargin = 75;

  const defaultsForParameter = function (parameter) {
    const type = parameter.charAt(0);
    if (type === 'p') {
      return [2, 20, 1];
    } else if (type === 'b') {
      return [1, 64, 1];
    } else if (type === 'c') {
      return [0, 2, 1];
    } else { // n, v, s, i, m
      return [0, 100000, 1000];
    }
  };

  const buildSliderForParameter = function (parameter, start, end, increment) {
    const _default = defaultsForParameter(parameter);
    start = start ? start : _default[0];
    end = end ? end : _default[1];
    increment = increment ? increment : _default[2];

    // build possible values
    const steps = [];
    for (let i = start; i < end; i += increment) {
      steps.push({
        label: i,
        method: 'skip',
        args: [parameter]
      });
    }

    // return parameter slider with styling and values;
    const slider = {
      pad: {
        t: topMargin
      },
      currentvalue: {
        xanchor: 'left',
        prefix: parameter + ' = ',
        font: {
          size: 20
        }
      },
      steps: steps
    };
    topMargin += 75;

    return {
      slider: slider,
      value: start
    };
  };

  window.addEventListener('DOMContentLoaded', function () {
    // plot controls
    const functionsSelect = document.getElementById('plotFunction');
    const xaxisSelect = document.getElementById('xaxis');
    const yaxisSelect = document.getElementById('yaxis');
    const plotButton = document.getElementById('plotButton');
    const plotDiv = document.getElementById('outputPlot');
    const startInput = document.getElementById('plotStart');
    const endInput = document.getElementById('plotEnd');

    // remove plot
    carouselsPlot.purge = function () {
      Plotly.purge(plotDiv);
    };

    // plotting main function
    plotButton.onclick = function () {
      topMargin = 75;

      // start and end of xaxis range
      const start = parseInt(startInput.value);
      const end = parseInt(endInput.value);
      if (isNaN(start) || isNaN(end)) {
        alert('X-axis range must be numeric');
        return;
      }

      const funcName = functionsSelect.value;
      const xaxis = xaxisSelect.value;
      const yaxis = carouselsOutput.analyzer.functionMetricAbstractionMap.scopes[0][funcName].mathSymbol.toString();

      // figure out the math symbols of all remaining (fixed) parameters
      const scope = [];
      const sliders = carouselsOutput.parameters.map(function (parameter) {
        return parameter.mathSymbol.toString();
      }).filter(function (parameter) {
        return parameter !== xaxis;
      }).map(function (parameter) {
        const sliderResult = buildSliderForParameter(parameter);
        scope.push(parameter + '=' + sliderResult.value);
        return sliderResult.slider;
      });
      plotDiv.style.height = (600 + ((sliders.length+1) * 75)) + 'px';

      // build traces
      const xTrace = [];
      const yPoints = [];
      for (let i = start; i < end; i++) {
        xTrace.push(i);
        yPoints.push(yaxis.replace(xaxis, i));
      }
      const yTrace = carouselsOutput.evaluate(yPoints, scope);

      // create new plot
      Plotly.newPlot(plotDiv, [{
        x: xTrace,
        y: yTrace,
        type: 'scatter',
        name: funcName
      }], {
        title: funcName + ' plot',
        xaxis: {
          title: xaxisSelect.value
        },
        yaxis: {
          title: yaxisSelect.value
        },
        sliders: sliders
      }, {
        height: 1000,
        responsive: true
      });

      // handle slider changes
      plotDiv.on('plotly_sliderchange', function (event) {
        const parameter = event.step.args[0];
        const value = event.step.value;
        for (let i = 0; i < scope.length; i++) {
          if (scope[i].startsWith(parameter+'=')) {
            scope[i] = parameter + '=' + value;
          }
        }

        const yTrace = carouselsOutput.evaluate(yPoints, scope);
        Plotly.addTraces(plotDiv, [{
          x: xTrace,
          y: yTrace,
          name: funcName,
          type: 'scatter'
        }]);
        Plotly.deleteTraces(plotDiv, 0);
      });
    };
  });
})();