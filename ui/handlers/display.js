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
