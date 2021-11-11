(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* global carousels */
const Plot = require('./plotting/plot.js');

function CarouselsWrapper(carousels) {
  this.carousels = carousels;
  this.carouselsOutput = null;
  this.plotter = new Plot();
}

CarouselsWrapper.prototype.setCarouselsOutput = function (output) {
  this.carouselsOutput = output;
  this.plotter.clear();
};

CarouselsWrapper.prototype.analyze = function (code, protocol, metric, simplify, language) {
  let result = { IR: null, debug: null, error: null, output: null };

  try {
    // Create a new carousels analyzer, parse the code using it.
    let analyzer = new carousels.Analyzer(language, code);
    result.IR = analyzer.IR;
    try {
      // Perform static analysis to produce symbolic output.
      analyzer.analyze(this.carousels.costs[protocol], metric);
      if (simplify) {  // Simplify symbolic output if requested.
        analyzer.simplifyClosedForms();
      }
      result.output = analyzer.symbolicOutput();
    } catch (err) {
      result.error = err;
    } finally {
      // Pretty print static analysis steps super-imposed over the code.
      result.debug = analyzer.prettyPrint();
    }
  } catch (err) {
    result.error = 'Error during parsing IR. Please look at the console for more information.\n';
    result.error += err.toString();
  }

  return result;
};

CarouselsWrapper.prototype.plot = function (funcName, xaxis, yaxis, start, end, scope) {
  // Set plot labels.
  this.plotter.setTitle('My Plot');
  this.plotter.setAxisLabels(xaxis, yaxis);

  // Figure out the global parameters sliders.
  const scopeList = [];
  for (const parameter of this.carouselsOutput.scopeParameters) {
    if (parameter == xaxis) {
      continue;
    }
    const value = this.plotter.addSlider(parameter);
    scopeList.push(parameter + '=' + value);
  }

  // Parse the user-given scope.
  for (let line of scope.split(';')) {
    line = line.trim().replace(/\s/g, "");
    if (line.length > 0) {
      scopeList.push(line);
    }
  }

  // Plot range.
  const X = [];
  for (let i = start; i < end; i++) {
    X.push(i);
  }

  // Evaluate the symbolic function being plotted over the desired range.
  const func = this.carouselsOutput.analyzer.functionMetricAbstractionMap
                     .scopes[0][funcName].mathSymbol.toString();
  const Y = this.carouselsOutput.evaluateAtPoints(func, scopeList, xaxis, X);

  // Plot the curve.
  this.plotter.plot(funcName, X, Y);
};

module.exports = CarouselsWrapper;

},{"./plotting/plot.js":6}],2:[function(require,module,exports){
module.exports = {
  merge_sort: 'fn merge_sort<T: Debug, P: Obliv>(slice: &[Possession<T, P>]) -> Vec<Possession<T, P>> where T: Ord + Clone {\n' +
    '    if slice.len() <= 1 {\n' +
    '        return slice.to_owned()\n' +
    '    }\n' +
    '\n' +
    '    let mid   = slice.len() / 2;\n' +
    '    let left  = merge_sort(&slice[0..mid]);\n' +
    '    let right = merge_sort(&slice[mid..slice.len()]);\n' +
    '    merge(&left, &right)\n' +
    '}\n' +
    '\n' +
    'fn merge<T: Debug, P: Obliv>(left: &[Possession<T, P>], right: &[Possession<T, P>]) -> Vec<Possession<T, P>> where T: Ord + Clone {\n' +
    '    let out_len = left.len() + right.len();\n' +
    '    let mut out = Vec::with_capacity(out_len);\n' +
    '\n' +
    '    let mut li = P::run(0);\n' +
    '    let mut ri = P::run(0);\n' +
    '\n' +
    '    let left_len = left.len();\n' +
    '    let right_len = right.len();\n' +
    '\n' +
    '    for _ in 0..out_len {\n' +
    '        out.push({\n' +
    '            obliv if li == left_len || ri < right_len && Oram(right)[ri] > Oram(left)[li] {\n' +
    '                let arr = Oram(right);\n' +
    '                let o = arr[ri].clone();\n' +
    '                ri = ri + 1;\n' +
    '                o\n' +
    '            } else {\n' +
    '                let arr = Oram(left);\n' +
    '                let o = arr[li].clone();\n' +
    '                li = li + 1;\n' +
    '                o\n' +
    '            }\n' +
    '        });\n' +
    '    }\n' +
    '    out\n' +
    '}',
  max: 'fn max<T: Debug, P: Obliv>(arr: &[Possession<T, P>]) -> Possession<T, P> where T: Ord + Clone {\n' +
    '    let max = arr[0];\n' +
    '    for x in arr {\n' +
    '        max = obliv if x > max {\n' +
    '            x\n' +
    '        } else {\n' +
    '            max\n' +
    '        }\n' +
    '    }\n' +
    '    max\n' +
    '}\n',
  innerProduct: 'fn inner_product<T: Debug, P: Obliv>(arr1: &[Possession<T, P>], arr2: &[Possession<T, P>]) -> Possession<T, P> where T: Ord + Clone {\n' +
    '    let product = arr1[0] * arr2[0];\n' +
    '    for i in 1..arr1.len() {\n' +
    '        product = product + (arr1[i] * arr2[i])\n' +
    '    }\n' +
    '    product\n' +
    '}\n'
};

},{}],3:[function(require,module,exports){
// carouselsPlot
module.exports = function (carouselsWrapper) {
  // Output tab.
  const successDiv = document.getElementById('outputSuccess');
  const FailureDiv = document.getElementById('outputFailure');
  const errorsDiv = document.getElementById('outputErrors');
  const functionsDiv = document.getElementById('outputFunctions');
  const parametersDiv = document.getElementById('outputParameters');

  // Plot tab.
  const outputRadio = document.getElementById('tab-2');
  const functionsSelect = document.getElementById('plotFunction');
  const xaxisSelect = document.getElementById('xaxis');
  const yaxisSelect = document.getElementById('yaxis');
  const plotButton = document.getElementById('plotButton');

  const resetPlotTab = function (success) {
    outputRadio.checked = true;  // Swith to the output tab.

    // Clear output content.
    plotButton.disabled = !success;
    functionsSelect.disabled = !success;
    xaxisSelect.disabled = !success;
    yaxisSelect.disabled = !success;
    functionsSelect.innerHTML = '';
    xaxisSelect.innerHTML = '';
    yaxisSelect.innerHTML = '';
  }

  return {
    // Display symbolic expression output.
    showOutput: function (output) {
      successDiv.style.display = 'block';
      FailureDiv.style.display = 'none';

      // fill in output tab
      functionsDiv.innerHTML = output.dumpAbstractions(true);
      parametersDiv.innerHTML = output.dumpParameters(true);

      // Enable the plot tab.      
      resetPlotTab(true);

      // Fill in function names.
      for (let func of output.getFunctionNames()) {
        const option = document.createElement('option');
        option.textContent = func;
        option.value = func;
        functionsSelect.appendChild(option);
      }

      // Fill in plot parameters.
      for (let parameter of output.scopeParameters) {
        const option = document.createElement('option');
        option.textContent = parameter;
        option.value = parameter;
        xaxisSelect.appendChild(option);
      }

      // y-axis can only be the metric.
      const metricOption = document.createElement('option');
      metricOption.textContent = output.analyzer.metricTitle;
      metricOption.value = output.analyzer.metricTitle;
      yaxisSelect.appendChild(metricOption);

      // Store output for plot.js to use when plotting is request.
      carouselsWrapper.setCarouselsOutput(output);
    },

    // Display errors.
    showError: function (err) {
      console.log(err);

      // Show error in output tab.
      successDiv.style.display = 'none';
      FailureDiv.style.display = 'block';
      errorsDiv.textContent = err.toString();

      // Disable the plot tab.
      resetPlotTab(false);

      // Clear any previous plot.
      carouselsWrapper.setCarouselsOutput(null);
    },

    // Debugging display of pretty-print debug output.
    showDebug: function (prettyPrint) {
      const debuggingDiv = document.getElementById('debuggingDiv');
      debuggingDiv.innerHTML = prettyPrint;
    },

    // Debugging display of parsed IR.
    showIR: function (IR) {
      const IRDiv = document.getElementById('IRDiv');
      IRDiv.textContent = JSON.stringify(IR, null, 4);
    }
  };
};

},{}],4:[function(require,module,exports){
const carouselsCodeSamples = require('../codesamples/samples.js');

// CodeMirror code editor
module.exports = function () {
  const codeSampleSelect = document.getElementById('codeSample');
  const textarea = document.getElementById('inputCode');
  const codeMirrorInstance = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    matchBrackets: true,
    tabMode: 'indent'
  });

  codeMirrorInstance.setSize('100%', 'auto');
  textarea.__codeMirrorInstance = codeMirrorInstance;

  // display code sample when chosen from select menu
  const chooseCodeSample = function () {
    const codeSampleName = codeSampleSelect.value;
    const code = carouselsCodeSamples[codeSampleName];
    codeMirrorInstance.setValue(code);
  };

  codeSampleSelect.onchange = chooseCodeSample;
  chooseCodeSample();

  // refresh codeMirror display when code tab becomes active
  document.getElementById('tab-1').onclick = function () {
    codeMirrorInstance.refresh();
  };
};

},{"../codesamples/samples.js":2}],5:[function(require,module,exports){
const carouselsCodeSamples = require('../codesamples/samples.js');

module.exports = function (costs, protcols) {
  // Populate code samples.
  const codeSampleSelect = document.getElementById('codeSample');
  for (const key in carouselsCodeSamples) {
    const option = document.createElement('option');
    option.textContent = key;
    option.value = key;
    codeSampleSelect.appendChild(option);
  }

  // Populate metrics drop down menu.
  const showMetrics = function (protocol) {
    const metricSelect = document.getElementById('metric');
    metricSelect.innerHTML = '';
    const cost = costs[protocol];
    for (const metric of cost['metrics']) {
      const option = document.createElement('option');
      option.textContent = metric.title;
      option.value = metric.title;
      metricSelect.appendChild(option);
    }

    const computeButton = document.getElementById('computeButton');
    computeButton.disabled = false;
  }

  // Populate protocols drop down menu.
  const protocolSelect = document.getElementById('protocol');
  for (const protocol in costs) {
    const option = document.createElement('option');
    option.textContent = protocol;
    option.value = protocol;
    option.selected = true;
    protocolSelect.appendChild(option);
    showMetrics(protocol);
  }
  
  // fill metricSelect when protocol is chosen
  protocolSelect.onchange = function () {
    showMetrics(this.value);
  };
};

},{"../codesamples/samples.js":2}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
/* global carousels */
const CarouselsWrapper = require('./carouselsWrapper.js');

const initializeHandlers = require('./handlers/display.js');

const populateControls = require('./load/populate.js');
const formatCodeMirror = require('./load/codemirror.js');

window.addEventListener('DOMContentLoaded', function () {
  // Set up everything after carousels has loaded.
  carousels.promise.then(function () {
    // Create a singletone wrapper instance for the carousels API.
    const carouselsWrapper = new CarouselsWrapper(carousels);
    const display = initializeHandlers(carouselsWrapper);
  
    // Populate values in drop-down menu controls.
    populateControls(carousels.costs, carousels.protocols);
    
    // Format code mirror.
    formatCodeMirror();
    
    // Add listeners for buttons and sliders.
    const computeButton = document.getElementById('computeButton');
    computeButton.onclick = function () {
      const protocol = document.getElementById('protocol').value;
      const metric = document.getElementById('metric').value;
      const simplify = document.getElementById('simplify').checked;
      const code = document.getElementById('inputCode').__codeMirrorInstance.getValue();

      const result = carouselsWrapper.analyze(code, protocol, metric, simplify, 'rust');
      if (result.error) {
        display.showError(result.error);
      }
      if (result.output) {
        display.showOutput(result.output);
      }
      if (result.IR) {
        display.showIR(result.IR);
      }
      if (result.debug) {
        display.showDebug(result.debug);
      }
    };
    
    const plotButton = document.getElementById('plotButton');
    plotButton.onclick = function () {
      console.log('plotting');
      // Plot labels.
      const funcName = document.getElementById('plotFunction').value;
      const xaxis = document.getElementById('xaxis').value;
      const yaxis = document.getElementById('yaxis').value;

      // Plotting range.
      const start = document.getElementById('plotStart').value;
      const end = document.getElementById('plotEnd').value;
      if (isNaN(start) || isNaN(end)) {
        alert('X-axis range must be numeric');
        return;
      }
      
      // User-given scope.
      const scope = document.getElementById('manualScope').value;

      // Evaluate func and plot.
      carouselsWrapper.plot(funcName, xaxis, yaxis, start, end, scope);          
    };

    /*
    const plotDiv = document.getElementById('outputPlot');
    plotDiv.on('plotly_sliderchange', function (event) {});
    */
  });
});

},{"./carouselsWrapper.js":1,"./handlers/display.js":3,"./load/codemirror.js":4,"./load/populate.js":5}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ1aS9jYXJvdXNlbHNXcmFwcGVyLmpzIiwidWkvY29kZXNhbXBsZXMvc2FtcGxlcy5qcyIsInVpL2hhbmRsZXJzL2Rpc3BsYXkuanMiLCJ1aS9sb2FkL2NvZGVtaXJyb3IuanMiLCJ1aS9sb2FkL3BvcHVsYXRlLmpzIiwidWkvcGxvdHRpbmcvcGxvdC5qcyIsInVpL3VpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBnbG9iYWwgY2Fyb3VzZWxzICovXG5jb25zdCBQbG90ID0gcmVxdWlyZSgnLi9wbG90dGluZy9wbG90LmpzJyk7XG5cbmZ1bmN0aW9uIENhcm91c2Vsc1dyYXBwZXIoY2Fyb3VzZWxzKSB7XG4gIHRoaXMuY2Fyb3VzZWxzID0gY2Fyb3VzZWxzO1xuICB0aGlzLmNhcm91c2Vsc091dHB1dCA9IG51bGw7XG4gIHRoaXMucGxvdHRlciA9IG5ldyBQbG90KCk7XG59XG5cbkNhcm91c2Vsc1dyYXBwZXIucHJvdG90eXBlLnNldENhcm91c2Vsc091dHB1dCA9IGZ1bmN0aW9uIChvdXRwdXQpIHtcbiAgdGhpcy5jYXJvdXNlbHNPdXRwdXQgPSBvdXRwdXQ7XG4gIHRoaXMucGxvdHRlci5jbGVhcigpO1xufTtcblxuQ2Fyb3VzZWxzV3JhcHBlci5wcm90b3R5cGUuYW5hbHl6ZSA9IGZ1bmN0aW9uIChjb2RlLCBwcm90b2NvbCwgbWV0cmljLCBzaW1wbGlmeSwgbGFuZ3VhZ2UpIHtcbiAgbGV0IHJlc3VsdCA9IHsgSVI6IG51bGwsIGRlYnVnOiBudWxsLCBlcnJvcjogbnVsbCwgb3V0cHV0OiBudWxsIH07XG5cbiAgdHJ5IHtcbiAgICAvLyBDcmVhdGUgYSBuZXcgY2Fyb3VzZWxzIGFuYWx5emVyLCBwYXJzZSB0aGUgY29kZSB1c2luZyBpdC5cbiAgICBsZXQgYW5hbHl6ZXIgPSBuZXcgY2Fyb3VzZWxzLkFuYWx5emVyKGxhbmd1YWdlLCBjb2RlKTtcbiAgICByZXN1bHQuSVIgPSBhbmFseXplci5JUjtcbiAgICB0cnkge1xuICAgICAgLy8gUGVyZm9ybSBzdGF0aWMgYW5hbHlzaXMgdG8gcHJvZHVjZSBzeW1ib2xpYyBvdXRwdXQuXG4gICAgICBhbmFseXplci5hbmFseXplKHRoaXMuY2Fyb3VzZWxzLmNvc3RzW3Byb3RvY29sXSwgbWV0cmljKTtcbiAgICAgIGlmIChzaW1wbGlmeSkgeyAgLy8gU2ltcGxpZnkgc3ltYm9saWMgb3V0cHV0IGlmIHJlcXVlc3RlZC5cbiAgICAgICAgYW5hbHl6ZXIuc2ltcGxpZnlDbG9zZWRGb3JtcygpO1xuICAgICAgfVxuICAgICAgcmVzdWx0Lm91dHB1dCA9IGFuYWx5emVyLnN5bWJvbGljT3V0cHV0KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXN1bHQuZXJyb3IgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFByZXR0eSBwcmludCBzdGF0aWMgYW5hbHlzaXMgc3RlcHMgc3VwZXItaW1wb3NlZCBvdmVyIHRoZSBjb2RlLlxuICAgICAgcmVzdWx0LmRlYnVnID0gYW5hbHl6ZXIucHJldHR5UHJpbnQoKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJlc3VsdC5lcnJvciA9ICdFcnJvciBkdXJpbmcgcGFyc2luZyBJUi4gUGxlYXNlIGxvb2sgYXQgdGhlIGNvbnNvbGUgZm9yIG1vcmUgaW5mb3JtYXRpb24uXFxuJztcbiAgICByZXN1bHQuZXJyb3IgKz0gZXJyLnRvU3RyaW5nKCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuQ2Fyb3VzZWxzV3JhcHBlci5wcm90b3R5cGUucGxvdCA9IGZ1bmN0aW9uIChmdW5jTmFtZSwgeGF4aXMsIHlheGlzLCBzdGFydCwgZW5kLCBzY29wZSkge1xuICAvLyBTZXQgcGxvdCBsYWJlbHMuXG4gIHRoaXMucGxvdHRlci5zZXRUaXRsZSgnTXkgUGxvdCcpO1xuICB0aGlzLnBsb3R0ZXIuc2V0QXhpc0xhYmVscyh4YXhpcywgeWF4aXMpO1xuXG4gIC8vIEZpZ3VyZSBvdXQgdGhlIGdsb2JhbCBwYXJhbWV0ZXJzIHNsaWRlcnMuXG4gIGNvbnN0IHNjb3BlTGlzdCA9IFtdO1xuICBmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiB0aGlzLmNhcm91c2Vsc091dHB1dC5zY29wZVBhcmFtZXRlcnMpIHtcbiAgICBpZiAocGFyYW1ldGVyID09IHhheGlzKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnBsb3R0ZXIuYWRkU2xpZGVyKHBhcmFtZXRlcik7XG4gICAgc2NvcGVMaXN0LnB1c2gocGFyYW1ldGVyICsgJz0nICsgdmFsdWUpO1xuICB9XG5cbiAgLy8gUGFyc2UgdGhlIHVzZXItZ2l2ZW4gc2NvcGUuXG4gIGZvciAobGV0IGxpbmUgb2Ygc2NvcGUuc3BsaXQoJzsnKSkge1xuICAgIGxpbmUgPSBsaW5lLnRyaW0oKS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XG4gICAgaWYgKGxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgc2NvcGVMaXN0LnB1c2gobGluZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUGxvdCByYW5nZS5cbiAgY29uc3QgWCA9IFtdO1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIFgucHVzaChpKTtcbiAgfVxuXG4gIC8vIEV2YWx1YXRlIHRoZSBzeW1ib2xpYyBmdW5jdGlvbiBiZWluZyBwbG90dGVkIG92ZXIgdGhlIGRlc2lyZWQgcmFuZ2UuXG4gIGNvbnN0IGZ1bmMgPSB0aGlzLmNhcm91c2Vsc091dHB1dC5hbmFseXplci5mdW5jdGlvbk1ldHJpY0Fic3RyYWN0aW9uTWFwXG4gICAgICAgICAgICAgICAgICAgICAuc2NvcGVzWzBdW2Z1bmNOYW1lXS5tYXRoU3ltYm9sLnRvU3RyaW5nKCk7XG4gIGNvbnN0IFkgPSB0aGlzLmNhcm91c2Vsc091dHB1dC5ldmFsdWF0ZUF0UG9pbnRzKGZ1bmMsIHNjb3BlTGlzdCwgeGF4aXMsIFgpO1xuXG4gIC8vIFBsb3QgdGhlIGN1cnZlLlxuICB0aGlzLnBsb3R0ZXIucGxvdChmdW5jTmFtZSwgWCwgWSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhcm91c2Vsc1dyYXBwZXI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWVyZ2Vfc29ydDogJ2ZuIG1lcmdlX3NvcnQ8VDogRGVidWcsIFA6IE9ibGl2PihzbGljZTogJltQb3NzZXNzaW9uPFQsIFA+XSkgLT4gVmVjPFBvc3Nlc3Npb248VCwgUD4+IHdoZXJlIFQ6IE9yZCArIENsb25lIHtcXG4nICtcbiAgICAnICAgIGlmIHNsaWNlLmxlbigpIDw9IDEge1xcbicgK1xuICAgICcgICAgICAgIHJldHVybiBzbGljZS50b19vd25lZCgpXFxuJyArXG4gICAgJyAgICB9XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICcgICAgbGV0IG1pZCAgID0gc2xpY2UubGVuKCkgLyAyO1xcbicgK1xuICAgICcgICAgbGV0IGxlZnQgID0gbWVyZ2Vfc29ydCgmc2xpY2VbMC4ubWlkXSk7XFxuJyArXG4gICAgJyAgICBsZXQgcmlnaHQgPSBtZXJnZV9zb3J0KCZzbGljZVttaWQuLnNsaWNlLmxlbigpXSk7XFxuJyArXG4gICAgJyAgICBtZXJnZSgmbGVmdCwgJnJpZ2h0KVxcbicgK1xuICAgICd9XFxuJyArXG4gICAgJ1xcbicgK1xuICAgICdmbiBtZXJnZTxUOiBEZWJ1ZywgUDogT2JsaXY+KGxlZnQ6ICZbUG9zc2Vzc2lvbjxULCBQPl0sIHJpZ2h0OiAmW1Bvc3Nlc3Npb248VCwgUD5dKSAtPiBWZWM8UG9zc2Vzc2lvbjxULCBQPj4gd2hlcmUgVDogT3JkICsgQ2xvbmUge1xcbicgK1xuICAgICcgICAgbGV0IG91dF9sZW4gPSBsZWZ0LmxlbigpICsgcmlnaHQubGVuKCk7XFxuJyArXG4gICAgJyAgICBsZXQgbXV0IG91dCA9IFZlYzo6d2l0aF9jYXBhY2l0eShvdXRfbGVuKTtcXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICBsZXQgbXV0IGxpID0gUDo6cnVuKDApO1xcbicgK1xuICAgICcgICAgbGV0IG11dCByaSA9IFA6OnJ1bigwKTtcXG4nICtcbiAgICAnXFxuJyArXG4gICAgJyAgICBsZXQgbGVmdF9sZW4gPSBsZWZ0LmxlbigpO1xcbicgK1xuICAgICcgICAgbGV0IHJpZ2h0X2xlbiA9IHJpZ2h0LmxlbigpO1xcbicgK1xuICAgICdcXG4nICtcbiAgICAnICAgIGZvciBfIGluIDAuLm91dF9sZW4ge1xcbicgK1xuICAgICcgICAgICAgIG91dC5wdXNoKHtcXG4nICtcbiAgICAnICAgICAgICAgICAgb2JsaXYgaWYgbGkgPT0gbGVmdF9sZW4gfHwgcmkgPCByaWdodF9sZW4gJiYgT3JhbShyaWdodClbcmldID4gT3JhbShsZWZ0KVtsaV0ge1xcbicgK1xuICAgICcgICAgICAgICAgICAgICAgbGV0IGFyciA9IE9yYW0ocmlnaHQpO1xcbicgK1xuICAgICcgICAgICAgICAgICAgICAgbGV0IG8gPSBhcnJbcmldLmNsb25lKCk7XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICByaSA9IHJpICsgMTtcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG9cXG4nICtcbiAgICAnICAgICAgICAgICAgfSBlbHNlIHtcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIGxldCBhcnIgPSBPcmFtKGxlZnQpO1xcbicgK1xuICAgICcgICAgICAgICAgICAgICAgbGV0IG8gPSBhcnJbbGldLmNsb25lKCk7XFxuJyArXG4gICAgJyAgICAgICAgICAgICAgICBsaSA9IGxpICsgMTtcXG4nICtcbiAgICAnICAgICAgICAgICAgICAgIG9cXG4nICtcbiAgICAnICAgICAgICAgICAgfVxcbicgK1xuICAgICcgICAgICAgIH0pO1xcbicgK1xuICAgICcgICAgfVxcbicgK1xuICAgICcgICAgb3V0XFxuJyArXG4gICAgJ30nLFxuICBtYXg6ICdmbiBtYXg8VDogRGVidWcsIFA6IE9ibGl2PihhcnI6ICZbUG9zc2Vzc2lvbjxULCBQPl0pIC0+IFBvc3Nlc3Npb248VCwgUD4gd2hlcmUgVDogT3JkICsgQ2xvbmUge1xcbicgK1xuICAgICcgICAgbGV0IG1heCA9IGFyclswXTtcXG4nICtcbiAgICAnICAgIGZvciB4IGluIGFyciB7XFxuJyArXG4gICAgJyAgICAgICAgbWF4ID0gb2JsaXYgaWYgeCA+IG1heCB7XFxuJyArXG4gICAgJyAgICAgICAgICAgIHhcXG4nICtcbiAgICAnICAgICAgICB9IGVsc2Uge1xcbicgK1xuICAgICcgICAgICAgICAgICBtYXhcXG4nICtcbiAgICAnICAgICAgICB9XFxuJyArXG4gICAgJyAgICB9XFxuJyArXG4gICAgJyAgICBtYXhcXG4nICtcbiAgICAnfVxcbicsXG4gIGlubmVyUHJvZHVjdDogJ2ZuIGlubmVyX3Byb2R1Y3Q8VDogRGVidWcsIFA6IE9ibGl2PihhcnIxOiAmW1Bvc3Nlc3Npb248VCwgUD5dLCBhcnIyOiAmW1Bvc3Nlc3Npb248VCwgUD5dKSAtPiBQb3NzZXNzaW9uPFQsIFA+IHdoZXJlIFQ6IE9yZCArIENsb25lIHtcXG4nICtcbiAgICAnICAgIGxldCBwcm9kdWN0ID0gYXJyMVswXSAqIGFycjJbMF07XFxuJyArXG4gICAgJyAgICBmb3IgaSBpbiAxLi5hcnIxLmxlbigpIHtcXG4nICtcbiAgICAnICAgICAgICBwcm9kdWN0ID0gcHJvZHVjdCArIChhcnIxW2ldICogYXJyMltpXSlcXG4nICtcbiAgICAnICAgIH1cXG4nICtcbiAgICAnICAgIHByb2R1Y3RcXG4nICtcbiAgICAnfVxcbidcbn07XG4iLCIvLyBjYXJvdXNlbHNQbG90XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYXJvdXNlbHNXcmFwcGVyKSB7XG4gIC8vIE91dHB1dCB0YWIuXG4gIGNvbnN0IHN1Y2Nlc3NEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0U3VjY2VzcycpO1xuICBjb25zdCBGYWlsdXJlRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dEZhaWx1cmUnKTtcbiAgY29uc3QgZXJyb3JzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dEVycm9ycycpO1xuICBjb25zdCBmdW5jdGlvbnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0RnVuY3Rpb25zJyk7XG4gIGNvbnN0IHBhcmFtZXRlcnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0UGFyYW1ldGVycycpO1xuXG4gIC8vIFBsb3QgdGFiLlxuICBjb25zdCBvdXRwdXRSYWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWItMicpO1xuICBjb25zdCBmdW5jdGlvbnNTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxvdEZ1bmN0aW9uJyk7XG4gIGNvbnN0IHhheGlzU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hheGlzJyk7XG4gIGNvbnN0IHlheGlzU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3lheGlzJyk7XG4gIGNvbnN0IHBsb3RCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxvdEJ1dHRvbicpO1xuXG4gIGNvbnN0IHJlc2V0UGxvdFRhYiA9IGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgb3V0cHV0UmFkaW8uY2hlY2tlZCA9IHRydWU7ICAvLyBTd2l0aCB0byB0aGUgb3V0cHV0IHRhYi5cblxuICAgIC8vIENsZWFyIG91dHB1dCBjb250ZW50LlxuICAgIHBsb3RCdXR0b24uZGlzYWJsZWQgPSAhc3VjY2VzcztcbiAgICBmdW5jdGlvbnNTZWxlY3QuZGlzYWJsZWQgPSAhc3VjY2VzcztcbiAgICB4YXhpc1NlbGVjdC5kaXNhYmxlZCA9ICFzdWNjZXNzO1xuICAgIHlheGlzU2VsZWN0LmRpc2FibGVkID0gIXN1Y2Nlc3M7XG4gICAgZnVuY3Rpb25zU2VsZWN0LmlubmVySFRNTCA9ICcnO1xuICAgIHhheGlzU2VsZWN0LmlubmVySFRNTCA9ICcnO1xuICAgIHlheGlzU2VsZWN0LmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBEaXNwbGF5IHN5bWJvbGljIGV4cHJlc3Npb24gb3V0cHV0LlxuICAgIHNob3dPdXRwdXQ6IGZ1bmN0aW9uIChvdXRwdXQpIHtcbiAgICAgIHN1Y2Nlc3NEaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICBGYWlsdXJlRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgIC8vIGZpbGwgaW4gb3V0cHV0IHRhYlxuICAgICAgZnVuY3Rpb25zRGl2LmlubmVySFRNTCA9IG91dHB1dC5kdW1wQWJzdHJhY3Rpb25zKHRydWUpO1xuICAgICAgcGFyYW1ldGVyc0Rpdi5pbm5lckhUTUwgPSBvdXRwdXQuZHVtcFBhcmFtZXRlcnModHJ1ZSk7XG5cbiAgICAgIC8vIEVuYWJsZSB0aGUgcGxvdCB0YWIuICAgICAgXG4gICAgICByZXNldFBsb3RUYWIodHJ1ZSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gZnVuY3Rpb24gbmFtZXMuXG4gICAgICBmb3IgKGxldCBmdW5jIG9mIG91dHB1dC5nZXRGdW5jdGlvbk5hbWVzKCkpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGZ1bmM7XG4gICAgICAgIG9wdGlvbi52YWx1ZSA9IGZ1bmM7XG4gICAgICAgIGZ1bmN0aW9uc1NlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgICAgfVxuXG4gICAgICAvLyBGaWxsIGluIHBsb3QgcGFyYW1ldGVycy5cbiAgICAgIGZvciAobGV0IHBhcmFtZXRlciBvZiBvdXRwdXQuc2NvcGVQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBwYXJhbWV0ZXI7XG4gICAgICAgIG9wdGlvbi52YWx1ZSA9IHBhcmFtZXRlcjtcbiAgICAgICAgeGF4aXNTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgICAgIH1cblxuICAgICAgLy8geS1heGlzIGNhbiBvbmx5IGJlIHRoZSBtZXRyaWMuXG4gICAgICBjb25zdCBtZXRyaWNPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgIG1ldHJpY09wdGlvbi50ZXh0Q29udGVudCA9IG91dHB1dC5hbmFseXplci5tZXRyaWNUaXRsZTtcbiAgICAgIG1ldHJpY09wdGlvbi52YWx1ZSA9IG91dHB1dC5hbmFseXplci5tZXRyaWNUaXRsZTtcbiAgICAgIHlheGlzU2VsZWN0LmFwcGVuZENoaWxkKG1ldHJpY09wdGlvbik7XG5cbiAgICAgIC8vIFN0b3JlIG91dHB1dCBmb3IgcGxvdC5qcyB0byB1c2Ugd2hlbiBwbG90dGluZyBpcyByZXF1ZXN0LlxuICAgICAgY2Fyb3VzZWxzV3JhcHBlci5zZXRDYXJvdXNlbHNPdXRwdXQob3V0cHV0KTtcbiAgICB9LFxuXG4gICAgLy8gRGlzcGxheSBlcnJvcnMuXG4gICAgc2hvd0Vycm9yOiBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuXG4gICAgICAvLyBTaG93IGVycm9yIGluIG91dHB1dCB0YWIuXG4gICAgICBzdWNjZXNzRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBGYWlsdXJlRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgZXJyb3JzRGl2LnRleHRDb250ZW50ID0gZXJyLnRvU3RyaW5nKCk7XG5cbiAgICAgIC8vIERpc2FibGUgdGhlIHBsb3QgdGFiLlxuICAgICAgcmVzZXRQbG90VGFiKGZhbHNlKTtcblxuICAgICAgLy8gQ2xlYXIgYW55IHByZXZpb3VzIHBsb3QuXG4gICAgICBjYXJvdXNlbHNXcmFwcGVyLnNldENhcm91c2Vsc091dHB1dChudWxsKTtcbiAgICB9LFxuXG4gICAgLy8gRGVidWdnaW5nIGRpc3BsYXkgb2YgcHJldHR5LXByaW50IGRlYnVnIG91dHB1dC5cbiAgICBzaG93RGVidWc6IGZ1bmN0aW9uIChwcmV0dHlQcmludCkge1xuICAgICAgY29uc3QgZGVidWdnaW5nRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlYnVnZ2luZ0RpdicpO1xuICAgICAgZGVidWdnaW5nRGl2LmlubmVySFRNTCA9IHByZXR0eVByaW50O1xuICAgIH0sXG5cbiAgICAvLyBEZWJ1Z2dpbmcgZGlzcGxheSBvZiBwYXJzZWQgSVIuXG4gICAgc2hvd0lSOiBmdW5jdGlvbiAoSVIpIHtcbiAgICAgIGNvbnN0IElSRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0lSRGl2Jyk7XG4gICAgICBJUkRpdi50ZXh0Q29udGVudCA9IEpTT04uc3RyaW5naWZ5KElSLCBudWxsLCA0KTtcbiAgICB9XG4gIH07XG59O1xuIiwiY29uc3QgY2Fyb3VzZWxzQ29kZVNhbXBsZXMgPSByZXF1aXJlKCcuLi9jb2Rlc2FtcGxlcy9zYW1wbGVzLmpzJyk7XG5cbi8vIENvZGVNaXJyb3IgY29kZSBlZGl0b3Jcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBjb2RlU2FtcGxlU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGVTYW1wbGUnKTtcbiAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXRDb2RlJyk7XG4gIGNvbnN0IGNvZGVNaXJyb3JJbnN0YW5jZSA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKHRleHRhcmVhLCB7XG4gICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICB0YWJNb2RlOiAnaW5kZW50J1xuICB9KTtcblxuICBjb2RlTWlycm9ySW5zdGFuY2Uuc2V0U2l6ZSgnMTAwJScsICdhdXRvJyk7XG4gIHRleHRhcmVhLl9fY29kZU1pcnJvckluc3RhbmNlID0gY29kZU1pcnJvckluc3RhbmNlO1xuXG4gIC8vIGRpc3BsYXkgY29kZSBzYW1wbGUgd2hlbiBjaG9zZW4gZnJvbSBzZWxlY3QgbWVudVxuICBjb25zdCBjaG9vc2VDb2RlU2FtcGxlID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNvZGVTYW1wbGVOYW1lID0gY29kZVNhbXBsZVNlbGVjdC52YWx1ZTtcbiAgICBjb25zdCBjb2RlID0gY2Fyb3VzZWxzQ29kZVNhbXBsZXNbY29kZVNhbXBsZU5hbWVdO1xuICAgIGNvZGVNaXJyb3JJbnN0YW5jZS5zZXRWYWx1ZShjb2RlKTtcbiAgfTtcblxuICBjb2RlU2FtcGxlU2VsZWN0Lm9uY2hhbmdlID0gY2hvb3NlQ29kZVNhbXBsZTtcbiAgY2hvb3NlQ29kZVNhbXBsZSgpO1xuXG4gIC8vIHJlZnJlc2ggY29kZU1pcnJvciBkaXNwbGF5IHdoZW4gY29kZSB0YWIgYmVjb21lcyBhY3RpdmVcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi0xJykub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb2RlTWlycm9ySW5zdGFuY2UucmVmcmVzaCgpO1xuICB9O1xufTtcbiIsImNvbnN0IGNhcm91c2Vsc0NvZGVTYW1wbGVzID0gcmVxdWlyZSgnLi4vY29kZXNhbXBsZXMvc2FtcGxlcy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb3N0cywgcHJvdGNvbHMpIHtcbiAgLy8gUG9wdWxhdGUgY29kZSBzYW1wbGVzLlxuICBjb25zdCBjb2RlU2FtcGxlU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGVTYW1wbGUnKTtcbiAgZm9yIChjb25zdCBrZXkgaW4gY2Fyb3VzZWxzQ29kZVNhbXBsZXMpIHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udGV4dENvbnRlbnQgPSBrZXk7XG4gICAgb3B0aW9uLnZhbHVlID0ga2V5O1xuICAgIGNvZGVTYW1wbGVTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgfVxuXG4gIC8vIFBvcHVsYXRlIG1ldHJpY3MgZHJvcCBkb3duIG1lbnUuXG4gIGNvbnN0IHNob3dNZXRyaWNzID0gZnVuY3Rpb24gKHByb3RvY29sKSB7XG4gICAgY29uc3QgbWV0cmljU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYycpO1xuICAgIG1ldHJpY1NlbGVjdC5pbm5lckhUTUwgPSAnJztcbiAgICBjb25zdCBjb3N0ID0gY29zdHNbcHJvdG9jb2xdO1xuICAgIGZvciAoY29uc3QgbWV0cmljIG9mIGNvc3RbJ21ldHJpY3MnXSkge1xuICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBtZXRyaWMudGl0bGU7XG4gICAgICBvcHRpb24udmFsdWUgPSBtZXRyaWMudGl0bGU7XG4gICAgICBtZXRyaWNTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wdXRlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbXB1dGVCdXR0b24nKTtcbiAgICBjb21wdXRlQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIH1cblxuICAvLyBQb3B1bGF0ZSBwcm90b2NvbHMgZHJvcCBkb3duIG1lbnUuXG4gIGNvbnN0IHByb3RvY29sU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb3RvY29sJyk7XG4gIGZvciAoY29uc3QgcHJvdG9jb2wgaW4gY29zdHMpIHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udGV4dENvbnRlbnQgPSBwcm90b2NvbDtcbiAgICBvcHRpb24udmFsdWUgPSBwcm90b2NvbDtcbiAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgIHByb3RvY29sU2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgc2hvd01ldHJpY3MocHJvdG9jb2wpO1xuICB9XG4gIFxuICAvLyBmaWxsIG1ldHJpY1NlbGVjdCB3aGVuIHByb3RvY29sIGlzIGNob3NlblxuICBwcm90b2NvbFNlbGVjdC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG93TWV0cmljcyh0aGlzLnZhbHVlKTtcbiAgfTtcbn07XG4iLCIvKiBnbG9iYWwgUGxvdGx5ICovXG5jb25zdCBESVZfSEVJR0hUID0gNjAwO1xuY29uc3QgUExPVF9IRUlHSFQgPSAxMDAwO1xuY29uc3QgTUFSR0lOX0ZPUl9PTkVfU0xJREVSID0gNzU7XG5cbmNvbnN0IFBBUkFNRVRFUl9TTElERVJfQ09ORklHID0ge1xuICBwOiBbMiwgMjAsIDFdLFxuICBiOiBbMSwgNjQsIDFdLFxuICBjOiBbMCwgMiwgMV0sXG4gIG46IFswLCAxMDAsIDVdLFxuICB2OiBbMCwgMTAwLCA1XVxufTtcblxuY29uc3QgT1BUUyA9IHtcbiAgaGVpZ2h0OiBQTE9UX0hFSUdIVCxcbiAgcmVzcG9uc2l2ZTogdHJ1ZVxufTtcblxuZnVuY3Rpb24gQ2Fyb3VzZWxzUGxvdCgpIHtcbiAgdGhpcy50cmFjZXMgPSBbXTtcbiAgdGhpcy5zbGlkZXJzID0gW107XG4gIHRoaXMubGFiZWxzID0geyBzbGlkZXJzOiBbXSB9O1xuICB0aGlzLnNsaWRlcnNNYXJnaW4gPSAwO1xuICB0aGlzLmRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXRQbG90Jyk7XG59XG5cbkNhcm91c2Vsc1Bsb3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRyYWNlcyA9IFtdO1xuICB0aGlzLnNsaWRlcnMgPSBbXTtcbiAgdGhpcy5sYWJlbHMgPSB7IHNsaWRlcnM6IFtdIH07XG4gIHRoaXMuc2xpZGVyc01hcmdpbiA9IDA7XG4gIFBsb3RseS5wdXJnZSh0aGlzLmRpdik7XG59O1xuXG5DYXJvdXNlbHNQbG90LnByb3RvdHlwZS5zZXRUaXRsZSA9IGZ1bmN0aW9uICh0aXRsZSkge1xuICB0aGlzLmxhYmVscy50aXRsZSA9IHRpdGxlICsgJyBwbG90Jztcbn07XG5cbkNhcm91c2Vsc1Bsb3QucHJvdG90eXBlLnNldEF4aXNMYWJlbHMgPSBmdW5jdGlvbiAoeGF4aXMsIHlheGlzKSB7XG4gIHRoaXMubGFiZWxzLnhheGlzID0geyB0aXRsZTogeGF4aXMgfTtcbiAgdGhpcy5sYWJlbHMueWF4aXMgPSB7IHRpdGxlOiB5YXhpcyB9O1xufTtcblxuQ2Fyb3VzZWxzUGxvdC5wcm90b3R5cGUuYWRkU2xpZGVyID0gZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuICB0aGlzLnNsaWRlcnNNYXJnaW4gKz0gTUFSR0lOX0ZPUl9PTkVfU0xJREVSO1xuXG4gIC8vIGJ1aWxkIHBvc3NpYmxlIHZhbHVlcy5cbiAgY29uc3QgW3N0YXJ0LCBlbmQsIGluY3JlbWVudF0gPSBQQVJBTUVURVJfU0xJREVSX0NPTkZJR1twYXJhbWV0ZXIuY2hhckF0KDApXTtcbiAgY29uc3Qgc3RlcHMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IGluY3JlbWVudCkge1xuICAgIHN0ZXBzLnB1c2goe1xuICAgICAgbGFiZWw6IGksXG4gICAgICBtZXRob2Q6ICdza2lwJyxcbiAgICAgIGFyZ3M6IFtwYXJhbWV0ZXJdXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBzbGlkZXIgPSB7XG4gICAgcGFkOiB7XG4gICAgICB0OiB0aGlzLnNsaWRlcnNNYXJnaW5cbiAgICB9LFxuICAgIGN1cnJlbnR2YWx1ZToge1xuICAgICAgeGFuY2hvcjogJ2xlZnQnLFxuICAgICAgcHJlZml4OiBwYXJhbWV0ZXIgKyAnID0gJyxcbiAgICAgIGZvbnQ6IHtcbiAgICAgICAgc2l6ZTogMjBcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0ZXBzOiBzdGVwc1xuICB9O1xuICAvLyB0aGlzLmxhYmVscy5zbGlkZXJzLnB1c2goc2xpZGVyKTtcbiAgcmV0dXJuIHN0YXJ0O1xufTtcblxuQ2Fyb3VzZWxzUGxvdC5wcm90b3R5cGUucGxvdCA9IGZ1bmN0aW9uIChuYW1lLCBYLCBZKSB7XG4gIHRoaXMudHJhY2VzLnB1c2goe3g6IFgsIHk6IFksIG5hbWU6IG5hbWUsIHR5cGU6ICdzY2F0dGVyJ30pO1xuXG4gIC8vIGNyZWF0ZSBuZXcgcGxvdFxuICBjb25zdCBoZWlnaHQgPSBESVZfSEVJR0hUICsgdGhpcy5zbGlkZXJzTWFyZ2luO1xuICB0aGlzLmRpdi5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICBjb25zdCBvcHRzID0ge2hlaWdodDogaGVpZ2h0LCByZXNwb25zaXZlOiB0cnVlIH07XG4gIFBsb3RseS5uZXdQbG90KHRoaXMuZGl2LCB0aGlzLnRyYWNlcywgdGhpcy5sYWJlbHMsIG9wdHMpO1xuXG4gIC8qXG4gIHRoaXMuZGl2Lm9uKCdwbG90bHlfc2xpZGVyY2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc3QgcGFyYW1ldGVyID0gZXZlbnQuc3RlcC5hcmdzWzBdO1xuICAgIGNvbnN0IHZhbHVlID0gZXZlbnQuc3RlcC52YWx1ZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluaXRpYWxTY29wZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGluaXRpYWxTY29wZVtpXS5zdGFydHNXaXRoKHBhcmFtZXRlcisnPScpKSB7XG4gICAgICAgIGluaXRpYWxTY29wZVtpXSA9IHBhcmFtZXRlciArICc9JyArIHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHlUcmFjZSA9IGNhcm91c2Vsc091dHB1dC5ldmFsdWF0ZUF0UG9pbnRzKHlheGlzLCBpbml0aWFsU2NvcGUsIHhheGlzLCBldmFsdWF0aW9uUG9pbnRzKTtcbiAgICBQbG90bHkuYWRkVHJhY2VzKHBsb3REaXYsIFt7XG4gICAgICB4OiBldmFsdWF0aW9uUG9pbnRzLFxuICAgICAgeTogeVRyYWNlLFxuICAgICAgbmFtZTogZnVuY05hbWUsXG4gICAgICB0eXBlOiAnc2NhdHRlcidcbiAgICB9XSk7XG4gICAgUGxvdGx5LmRlbGV0ZVRyYWNlcyhwbG90RGl2LCAwKTtcbiAgfSk7XG4gICovXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhcm91c2Vsc1Bsb3Q7XG4iLCIvKiBnbG9iYWwgY2Fyb3VzZWxzICovXG5jb25zdCBDYXJvdXNlbHNXcmFwcGVyID0gcmVxdWlyZSgnLi9jYXJvdXNlbHNXcmFwcGVyLmpzJyk7XG5cbmNvbnN0IGluaXRpYWxpemVIYW5kbGVycyA9IHJlcXVpcmUoJy4vaGFuZGxlcnMvZGlzcGxheS5qcycpO1xuXG5jb25zdCBwb3B1bGF0ZUNvbnRyb2xzID0gcmVxdWlyZSgnLi9sb2FkL3BvcHVsYXRlLmpzJyk7XG5jb25zdCBmb3JtYXRDb2RlTWlycm9yID0gcmVxdWlyZSgnLi9sb2FkL2NvZGVtaXJyb3IuanMnKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gIC8vIFNldCB1cCBldmVyeXRoaW5nIGFmdGVyIGNhcm91c2VscyBoYXMgbG9hZGVkLlxuICBjYXJvdXNlbHMucHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBDcmVhdGUgYSBzaW5nbGV0b25lIHdyYXBwZXIgaW5zdGFuY2UgZm9yIHRoZSBjYXJvdXNlbHMgQVBJLlxuICAgIGNvbnN0IGNhcm91c2Vsc1dyYXBwZXIgPSBuZXcgQ2Fyb3VzZWxzV3JhcHBlcihjYXJvdXNlbHMpO1xuICAgIGNvbnN0IGRpc3BsYXkgPSBpbml0aWFsaXplSGFuZGxlcnMoY2Fyb3VzZWxzV3JhcHBlcik7XG4gIFxuICAgIC8vIFBvcHVsYXRlIHZhbHVlcyBpbiBkcm9wLWRvd24gbWVudSBjb250cm9scy5cbiAgICBwb3B1bGF0ZUNvbnRyb2xzKGNhcm91c2Vscy5jb3N0cywgY2Fyb3VzZWxzLnByb3RvY29scyk7XG4gICAgXG4gICAgLy8gRm9ybWF0IGNvZGUgbWlycm9yLlxuICAgIGZvcm1hdENvZGVNaXJyb3IoKTtcbiAgICBcbiAgICAvLyBBZGQgbGlzdGVuZXJzIGZvciBidXR0b25zIGFuZCBzbGlkZXJzLlxuICAgIGNvbnN0IGNvbXB1dGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tcHV0ZUJ1dHRvbicpO1xuICAgIGNvbXB1dGVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHByb3RvY29sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb3RvY29sJykudmFsdWU7XG4gICAgICBjb25zdCBtZXRyaWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWV0cmljJykudmFsdWU7XG4gICAgICBjb25zdCBzaW1wbGlmeSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaW1wbGlmeScpLmNoZWNrZWQ7XG4gICAgICBjb25zdCBjb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lucHV0Q29kZScpLl9fY29kZU1pcnJvckluc3RhbmNlLmdldFZhbHVlKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNhcm91c2Vsc1dyYXBwZXIuYW5hbHl6ZShjb2RlLCBwcm90b2NvbCwgbWV0cmljLCBzaW1wbGlmeSwgJ3J1c3QnKTtcbiAgICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgZGlzcGxheS5zaG93RXJyb3IocmVzdWx0LmVycm9yKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQub3V0cHV0KSB7XG4gICAgICAgIGRpc3BsYXkuc2hvd091dHB1dChyZXN1bHQub3V0cHV0KTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQuSVIpIHtcbiAgICAgICAgZGlzcGxheS5zaG93SVIocmVzdWx0LklSKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQuZGVidWcpIHtcbiAgICAgICAgZGlzcGxheS5zaG93RGVidWcocmVzdWx0LmRlYnVnKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIGNvbnN0IHBsb3RCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxvdEJ1dHRvbicpO1xuICAgIHBsb3RCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwbG90dGluZycpO1xuICAgICAgLy8gUGxvdCBsYWJlbHMuXG4gICAgICBjb25zdCBmdW5jTmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbG90RnVuY3Rpb24nKS52YWx1ZTtcbiAgICAgIGNvbnN0IHhheGlzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hheGlzJykudmFsdWU7XG4gICAgICBjb25zdCB5YXhpcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd5YXhpcycpLnZhbHVlO1xuXG4gICAgICAvLyBQbG90dGluZyByYW5nZS5cbiAgICAgIGNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bsb3RTdGFydCcpLnZhbHVlO1xuICAgICAgY29uc3QgZW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bsb3RFbmQnKS52YWx1ZTtcbiAgICAgIGlmIChpc05hTihzdGFydCkgfHwgaXNOYU4oZW5kKSkge1xuICAgICAgICBhbGVydCgnWC1heGlzIHJhbmdlIG11c3QgYmUgbnVtZXJpYycpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFVzZXItZ2l2ZW4gc2NvcGUuXG4gICAgICBjb25zdCBzY29wZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYW51YWxTY29wZScpLnZhbHVlO1xuXG4gICAgICAvLyBFdmFsdWF0ZSBmdW5jIGFuZCBwbG90LlxuICAgICAgY2Fyb3VzZWxzV3JhcHBlci5wbG90KGZ1bmNOYW1lLCB4YXhpcywgeWF4aXMsIHN0YXJ0LCBlbmQsIHNjb3BlKTsgICAgICAgICAgXG4gICAgfTtcblxuICAgIC8qXG4gICAgY29uc3QgcGxvdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXRQbG90Jyk7XG4gICAgcGxvdERpdi5vbigncGxvdGx5X3NsaWRlcmNoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge30pO1xuICAgICovXG4gIH0pO1xufSk7XG4iXX0=
