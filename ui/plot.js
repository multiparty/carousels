/* global Plotly, carouselsOutput*/
let carouselsPlot = {};

(function () {
  const MARGIN_FOR_ONE_SLIDER = 75;
  let marginAggregate = 75;

  const defaultsForParameter = function (parameter) {
    const type = parameter.charAt(0);
    if (type === 'p') {
      return [2, 20, 1];
    } else if (type === 'b') {
      return [1, 64, 1];
    } else if (type === 'c') {
      return [0, 2, 1];
    } else { // n, v
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
        t: marginAggregate
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
    marginAggregate += MARGIN_FOR_ONE_SLIDER;

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
      marginAggregate = MARGIN_FOR_ONE_SLIDER;

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
      const initialScope = [];
      const sliders = carouselsOutput.scopeParameters.filter(function (parameter) {
        return parameter !== xaxis;
      }).map(function (parameter) {
        const sliderResult = buildSliderForParameter(parameter);
        initialScope.push(parameter + '=' + sliderResult.value);
        return sliderResult.slider;
      });

      // build traces
      const evaluationPoints = {};
      evaluationPoints[xaxis] = [];
      for (let i = start; i < end; i++) {
        evaluationPoints[xaxis].push(i);
      }
      const yTrace = carouselsOutput.evaluate(yaxis, evaluationPoints, initialScope);

      // create new plot
      plotDiv.style.height = (600 + marginAggregate) + 'px';
      Plotly.newPlot(plotDiv, [{
        x: evaluationPoints[xaxis],
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
        for (let i = 0; i < initialScope.length; i++) {
          if (initialScope[i].startsWith(parameter+'=')) {
            initialScope[i] = parameter + '=' + value;
          }
        }

        const yTrace = carouselsOutput.evaluate(yaxis, evaluationPoints, initialScope);
        Plotly.addTraces(plotDiv, [{
          x: evaluationPoints[xaxis],
          y: yTrace,
          name: funcName,
          type: 'scatter'
        }]);
        Plotly.deleteTraces(plotDiv, 0);
      });
    };
  });
})();