/* global CodeMirror, carousels */
var currentOutput = { // hardcoded output
  functions: {
    'merge_sort': 'F0(n0) = iff(n0, n0 >= 1, "F1(floor(n0 / 2), n0 - floor(n0 / 2)) + F0(floor(n0 / 2)) + F0(n0 - floor(n0 / 2))", 0)',
    'merge': 'F1(n1, n2) = (n1 + n2) * (2 * (p - 1) * (b + 1) * (n1 + n2) + (p - 1) * 4 * b)'
  },
  descriptions: [
    '<i>Protocol Parameters:</i>'
    + '<ul>'
    + '<li><i>p:</i> the number of parties</li>'
    + '<li><i>b:</i> the number of bits in the field</li>'
    + '</ul>',

    '<i>merge_sort:</i> &nbsp; '
    + 'F0(n0) = iff(n0 == 1, 0, F1( floor(n0 / 2), n0 - floor(n0 / 2) ) + F0(floor(n0 / 2)) + F0(n0 - floor(n0 / 2)) )'
    + '<ul>'
    + '<li><i>n0:</i> the length of variable merge_sort@slice</li>'
    + '</ul>',

    '<i>merge:</i> &nbsp; '
    + 'F1(n1, n2) = (n1 + n2) * (2 * (p-1) * (b+1) * (n1 + n2) + (p-1) * 4*b)'
    + '<ul>'
    + '<li><i>n1:</i> the length of variable merge@left</li>'
    + '<li><i>n2:</i> the length of variable merge@right</li>'
    + '</ul>',
  ],
  parameters: [
    'p',
    'b',
    'n0',
    'n1',
    'n2'
  ]
};

document.addEventListener("DOMContentLoaded", async function () {
  // CodeMirror code editor
  CodeMirror.fromTextArea(document.getElementById('inputCode'), {
    lineNumbers: true,
    matchBrackets: true,
    tabMode: 'indent',
    readOnly: true
  });

  // Get control elements
  var protocols = document.getElementById('protocol'),
    metric = document.getElementById('metric'),
    compute = document.getElementById('computeButton'),
    func = document.getElementById('func'),
    xaxis = document.getElementById('xaxis'),
    yaxis = document.getElementById('yaxis'),
    plot = document.getElementById('plotButton'),
    outputText = document.getElementById('outputText'),
    outputPlot = 'outputPlot';

  compute.disabled = true;
  plot.disabled = true;

  // Fill in protocol and metric select menus
  for (var costKey in carousels.costs) {
    var option = document.createElement('option');
    option.innerHTML = costKey;
    option.value = costKey;
    protocols.appendChild(option);
  }
  protocols.onchange = function () {
    metric.innerHTML = '';
    var protocol = protocols.value;
    var cost = carousels.costs[protocol];
    for (var i = 0; i < cost.metrics.length; i++) {
      var metricKey = cost.metrics[i].title;
      var option = document.createElement('option');
      option.innerHTML = metricKey;
      option.value = metricKey;
      metric.appendChild(option);
    }
  };
  metric.onchange = function () {
    compute.disabled = false;
  };

  // Compute: TODO
  compute.onclick = function () {
    // fill axis and function select menus
    func.innerHTML = '';
    xaxis.innerHTML = '';
    yaxis.innerHTML = '';
    for (var f in currentOutput.functions) {
      var fOption = document.createElement('option');
      fOption.innerHTML = f;
      fOption.value = f;
      func.appendChild(fOption);
    }
    for (var i = 0; i < currentOutput.parameters.length; i++) {
      var axis = currentOutput.parameters[i];
      var aOption = document.createElement('option');
      aOption.innerHTML = axis;
      aOption.value = axis;
      xaxis.appendChild(aOption.cloneNode(true));
      yaxis.appendChild(aOption);
    }

    // do not forget to add metric as a choice
    var mOption = document.createElement('option');
    mOption.innerHTML = metric.value;
    mOption.vlaue = metric.value;
    xaxis.appendChild(mOption.cloneNode(true));
    yaxis.appendChild(mOption);

    // enable plotting button
    plot.disabled = false;

    // display description
    outputText.innerHTML = '';
    for (var d = 0; d < currentOutput.descriptions.length; d++) {
      var span = document.createElement('span');
      span.className = 'equationSpan';
      span.innerHTML = currentOutput.descriptions[d];
      outputText.appendChild(span);
    }
  };

  // Finally the plot button
  plot.onclick = function () {
    plotFunc({
      p: 3,
      b: 10
    }, 'F0', 0, 100, outputPlot);
  };
});