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
