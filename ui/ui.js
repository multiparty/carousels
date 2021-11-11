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
