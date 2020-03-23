/* global CodeMirror */
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    // CodeMirror code editor
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
      const code = window.carouselsCodeSamples[codeSampleName];
      codeMirrorInstance.setValue(code);
    };

    codeSampleSelect.onchange = chooseCodeSample;
    chooseCodeSample();
  });
})();