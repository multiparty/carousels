/* global carousels, carouselsPlot */
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    const protocolSelect = document.getElementById('protocol');
    const metricSelect = document.getElementById('metric');
    const computeButton = document.getElementById('computeButton');
    const textarea = document.getElementById('inputCode');

    // output
    const outputRadio = document.getElementById('tab-2');
    const successDiv = document.getElementById('outputSuccess');
    const functionsDiv = document.getElementById('outputFunctions');
    const parametersDiv = document.getElementById('outputParameters');
    const FailureDiv = document.getElementById('outputFailure');
    const errorsDiv = document.getElementById('outputErrors');

    // plot controls
    const functionsSelect = document.getElementById('plotFunction');
    const xaxisSelect = document.getElementById('xaxis');
    const yaxisSelect = document.getElementById('yaxis');
    const plotButton = document.getElementById('plotButton');

    // debugging
    const debuggingDiv = document.getElementById('debuggingDiv');
    const IRDiv = document.getElementById('IRDiv');

    // Display output
    const showOutput = function (output) {
      // fill in output tab
      successDiv.style.display = 'block';
      FailureDiv.style.display = 'none';

      functionsDiv.innerHTML = output.dumpAbstractions(true);
      parametersDiv.innerHTML = output.dumpParameters(true);
      outputRadio.checked = true;

      // fill in plot tab
      plotButton.disabled = false;
      functionsSelect.disabled = false;
      xaxisSelect.disabled = false;
      yaxisSelect.disabled = false;
      functionsSelect.innerHTML = '';
      xaxisSelect.innerHTML = '';
      yaxisSelect.innerHTML = '';
      // fill in function names
      for (let func of output.getFunctionNames()) {
        const option = document.createElement('option');
        option.textContent = func;
        option.value = func;
        functionsSelect.appendChild(option);
      }
      // fill in plot parameters
      for (let parameter of output.scopeParameters) {
        const option = document.createElement('option');
        option.textContent = parameter;
        option.value = parameter;
        xaxisSelect.appendChild(option);
      }
      // y-axis can only be the metric
      const metricOption = document.createElement('option');
      metricOption.textContent = output.analyzer.metricTitle;
      metricOption.value = output.analyzer.metricTitle;
      yaxisSelect.appendChild(metricOption);

      // remove plot
      carouselsPlot.purge();
    };
    // Showing errors
    const showError = function (err) {
      // show error in output tab
      console.log(err);
      successDiv.style.display = 'none';
      FailureDiv.style.display = 'block';
      errorsDiv.textContent = err.toString();
      outputRadio.checked = true;

      // disable the plot tab
      plotButton.disabled = true;
      functionsSelect.disabled = true;
      xaxisSelect.disabled = true;
      yaxisSelect.disabled = true;
      functionsSelect.innerHTML = '';
      xaxisSelect.innerHTML = '';
      yaxisSelect.innerHTML = '';
      // remove plot
      carouselsPlot.purge();
    };
    // Debugging display of pretty-print output
    const showDebug = function (prettyPrint) {
      debuggingDiv.innerHTML = prettyPrint;
    };
    // Debugging display of IR
    const showIR = function (IR) {
      IRDiv.textContent = JSON.stringify(IR, null, 4);
    };

    // Analyze
    computeButton.onclick = function () {
      const protocolValue = protocolSelect.value;
      const metricValue = metricSelect.value;
      const code = textarea.__codeMirrorInstance.getValue();
      const language = 'rust';

      // Create a new carousels analyzer and dump IR
      let analyzer;
      try {
        analyzer = new carousels.Analyzer(language, code);
        showIR(analyzer.IR);
      } catch (err) {
        showError('Error during parsing IR. Please look at the console for more information.\n' + err.toString());
        return;
      }

      // analyze code and display outputs
      try {
        analyzer.analyze(carousels.costs[protocolValue], metricValue);
        showOutput(analyzer.symbolicOutput());
      } catch (err) {
        showError(err);
      } finally {
        showDebug(analyzer.prettyPrint());
      }
    }
  });
})();