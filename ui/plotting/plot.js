/* global Plotly */
const DIV_HEIGHT = 600;
const PLOT_HEIGHT = 1000;
const MARGIN_FOR_ONE_SLIDER = 75;

const PARAMETER_SLIDER_CONFIG = {
  p: [2, 20, 1],
  b: [1, 64, 1],
  c: [0, 2, 1],
  n: [0, 100, 5],
  v: [0, 100, 5]
};

const OPTS = {
  height: PLOT_HEIGHT,
  responsive: true
};

function CarouselsPlot() {
  this.traces = [];
  this.sliders = [];
  this.labels = { sliders: [] };
  this.slidersMargin = 0;
  this.div = document.getElementById('outputPlot');
}

CarouselsPlot.prototype.clear = function () {
  this.traces = [];
  this.sliders = [];
  this.labels = { sliders: [] };
  this.slidersMargin = 0;
  Plotly.purge(this.div);
};

CarouselsPlot.prototype.setTitle = function (title) {
  this.labels.title = title + ' plot';
};

CarouselsPlot.prototype.setAxisLabels = function (xaxis, yaxis) {
  this.labels.xaxis = { title: xaxis };
  this.labels.yaxis = { title: yaxis };
};

CarouselsPlot.prototype.addSlider = function (parameter) {
  this.slidersMargin += MARGIN_FOR_ONE_SLIDER;

  // build possible values.
  const [start, end, increment] = PARAMETER_SLIDER_CONFIG[parameter.charAt(0)];
  const steps = [];
  for (let i = start; i < end; i += increment) {
    steps.push({
      label: i,
      method: 'skip',
      args: [parameter]
    });
  }

  const slider = {
    pad: {
      t: this.slidersMargin
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
  // this.labels.sliders.push(slider);
  return start;
};

CarouselsPlot.prototype.plot = function (name, X, Y) {
  this.traces.push({x: X, y: Y, name: name, type: 'scatter'});

  // create new plot
  const height = DIV_HEIGHT + this.slidersMargin;
  this.div.style.height = height + 'px';
  const opts = {height: height, responsive: true };
  Plotly.newPlot(this.div, this.traces, this.labels, opts);

  /*
  this.div.on('plotly_sliderchange', function (event) {
    const parameter = event.step.args[0];
    const value = event.step.value;
    for (let i = 0; i < initialScope.length; i++) {
      if (initialScope[i].startsWith(parameter+'=')) {
        initialScope[i] = parameter + '=' + value;
      }
    }

    const yTrace = carouselsOutput.evaluateAtPoints(yaxis, initialScope, xaxis, evaluationPoints);
    Plotly.addTraces(plotDiv, [{
      x: evaluationPoints,
      y: yTrace,
      name: funcName,
      type: 'scatter'
    }]);
    Plotly.deleteTraces(plotDiv, 0);
  });
  */
};

module.exports = CarouselsPlot;
