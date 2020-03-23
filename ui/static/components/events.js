/* global carousels */
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

    // debugging
    const debuggingDiv = document.getElementById('debuggingDiv');
    const IRDiv = document.getElementById('IRDiv');

    // Display output
    const showOutput = function (output) {
      successDiv.style.display = 'block';
      FailureDiv.style.display = 'none';

      const functions = output.equations.map(function (equation, i) {
        return output.description[i].toString() + '\n' + equation.toString();
      }).join('\n\n');
      const parameters = output.parameters.join('\n\n'); // parameters

      functionsDiv.textContent = functions;
      parametersDiv.textContent = parameters;

      outputRadio.checked = true;
    };
    // Showing errors
    const showError = function (err) {
      console.log(err);
      successDiv.style.display = 'none';
      FailureDiv.style.display = 'block';
      errorsDiv.textContent = err.toString();

      outputRadio.checked = true;
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
      const language = ['rustBGW'].indexOf(protocolValue) > -1 ? 'rust' : 'javascript';

      if (language !== 'rust') {
        alert('This protocol is not supported at this time');
        return;
      }

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
        showOutput(analyzer.symbolicResult());
      } catch (err) {
        showError(err);
      } finally {
        showDebug(analyzer.prettyPrint());
      }
    }
  });
})();