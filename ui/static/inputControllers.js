/* global carousels */
(function () {
  let codeSampleSelect, protocolSelect, metricSelect, computeButton;

  const showCodeSamples = function () {
    for (let key in window.carouselsCodeSamples) {
      if (Object.prototype.hasOwnProperty.call(window.carouselsCodeSamples, key)) {
        const option = document.createElement('option');
        option.textContent = key;
        option.value = key;
        codeSampleSelect.appendChild(option);
      }
    }
  };

  const showMetrics = function (protocol) {
    metricSelect.innerHTML = '';
    const cost = carousels.costs[protocol];
    for (let metric of cost['metrics']) {
      const option = document.createElement('option');
      option.textContent = metric.title;
      option.value = metric.title;
      metricSelect.appendChild(option);
    }
    computeButton.disabled = false;
  };

  const showProtocols = function () {
    let protocol;
    for (protocol in carousels.costs) {
      if (Object.prototype.hasOwnProperty.call(carousels.costs, protocol)) {
        const option = document.createElement('option');
        option.textContent = protocol;
        option.value = protocol;
        option.selected = true;
        protocolSelect.appendChild(option);
      }
    }
    showMetrics(protocol);
  };

  window.addEventListener('DOMContentLoaded', function () {
    // Get control elements
    codeSampleSelect = document.getElementById('codeSample');
    protocolSelect = document.getElementById('protocol');
    metricSelect = document.getElementById('metric');
    computeButton = document.getElementById('computeButton');

    // fill code samples select
    showCodeSamples();

    // fill metricSelect when protocol is chosen
    protocolSelect.onchange = function () {
      showMetrics(this.value);
    };

    // fill protocol select
    showProtocols();
  });
})();