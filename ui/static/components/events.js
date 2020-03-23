/* global carousels */
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    const protocolSelect = document.getElementById('protocol');
    const metricSelect = document.getElementById('metric');
    const computeButton = document.getElementById('computeButton');
    const textarea = document.getElementById('inputCode');
    const debuggingDiv = document.getElementById('debuggingDiv');
    const IRDiv = document.getElementById('IRDiv');

    // Display output
    const showOutput = function (output) {
      output.parameters.join('\n\n'); // parameters
      output.description.join('\n\n'); // description of parameters and abstractions
      output.equations.join('\n\n'); // symbolic equations
      console.log(output);
    };
    // Showing errors
    const showError = function (err) {
      console.log(err);
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

      // Create a new carousels analyzer and analyze code
      const analyzer = new carousels.Analyzer(language, code);
      showIR(analyzer.IR);
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