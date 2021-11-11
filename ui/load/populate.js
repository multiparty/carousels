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
