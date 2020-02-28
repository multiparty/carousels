/* global Plotly */

const babel = require('babel-core');
const math = require('mathjs');

const prettyStringify = function (obj) {
  return JSON.stringify(obj, null, 2);
};

var createMetric = require('./metric.js');
var plot = require('./plot.js');
var costs = require('./costs.js');

function mode(str, spec, outDiv) {  // modes for normal and preprocessing costs
  for (var op in spec) {
    window.spec[op] = math.parse(spec[op]);
  }

  var bbl = babel.transform(str, {
    plugins: [ createMetric(window.spec) ]
  });

  var bbl_metric = bbl.ast.program.metric;
  var bbl_result = bbl.ast.program.results;

  if (document.getElementById(outDiv).innerHTML === '' ) {
    document.getElementById(outDiv).innerHTML = prettyStringify(bbl_result, {maxLength:120}).trim();
  } else {
    var str1 = prettyStringify(bbl_result, {maxLength:120}).trim().replace(/":/, '_preproc.":');
    document.getElementById(outDiv).insertAdjacentHTML('beforeend', str1);
  }

  return plot.parse_values(bbl_metric);
}

function demo(specText, sel_param, preprocessing, inpText, outDiv) {
  var cost_analyzed = document.getElementById(specText).value;
  var spec = costs.costs[cost_analyzed];
  var spec_preproc = costs.costs_preProcessing[cost_analyzed];

  if (spec === 'nothing') {
    document.getElementById('checkbx').style.display = 'none';
    document.getElementById('param').style.display = 'none';
    return;
  }

  document.getElementById('checkbx').style.display = 'inline';
  document.getElementById('param').style.display = 'inline';
  document.getElementById('spec').value = prettyStringify(spec);

  var preproc = false;/* hide for now */  //document.getElementById(preprocessing).checked;
  var param = document.getElementById(sel_param).value;

  var str = document.getElementById(inpText).value;
  if (str.length === 0) {
    document.getElementById(outDiv).innerHTML = 'No input provided.';
  } else {
    try {
      document.getElementById(outDiv).innerHTML = ''; // clear out previouscost analysis results or error messages

      var modeResult = mode(str, spec, outDiv);
      var p = modeResult[0];
      var names = modeResult[1];
      var num_terms = modeResult[2];

      if (preproc === true) {
        modeResult = mode(str, spec_preproc, outDiv);
        p = p.concat(modeResult[0]);
        names = names.concat(modeResult[1].map((curr) => curr + '_preproc.'));
      }

      var results = plot.compute_values(p, num_terms);
      Plotly.purge('myPlot'); // clear out possible old plot
      if (num_terms > 1) {
        if (param === 'nothing') {
          plot.plot3d(cost_analyzed, names, results);
        } else if (param === 'numbits') {
          plot.plotslider(cost_analyzed, names, results.map((row,i) => plot.transpose(results[i])), '# of bits: ', '# of tiles (board width)');
        } else {
          plot.plotslider(cost_analyzed, names, results, '# of bits: ', '# of tiles (board width)');
        }
      } else {
        plot.plot2d(cost_analyzed, names, results);
      }
    } catch (err) {
      document.getElementById(outDiv).innerHTML = err.message;
    }
  }
}

math.simplify.rules.push({l: 'n*(n1+n2)', r: 'n*n1+n*n2'});  // distributive property

module.exports = demo;
