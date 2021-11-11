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
