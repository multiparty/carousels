function mode(str, spec, outDiv){ // modes for normal and preprocessing costs
  for (var op in spec) {
    window.spec[op] = math.parse(spec[op]);
  }
  Babel.registerPlugin('metric', createMetric(window.spec));

  var bbl = Babel.transform(str, {plugins: ['metric']});
  var bbl_metric = bbl.ast.program.metric;
  var bbl_result = bbl.ast.program.results;

  if (document.getElementById(outDiv).innerHTML == "" ) {
    document.getElementById(outDiv).innerHTML = stringify(bbl_result, {maxLength:120}).trim();
  } else {
    var str1 = stringify(bbl_result, {maxLength:120}).trim().replace(/":/, '_preproc.":'); ;
    document.getElementById(outDiv).insertAdjacentHTML('beforeend', str1);
  }

  return parse_values(bbl_metric);
}

function demo(specText, sel_param, preprocessing, inpText, outDiv) {
  var cost_analyzed = document.getElementById(specText).value;
  var spec = costs[cost_analyzed];
  // var spec_preproc = costs_preProcessing[cost_analyzed];

  if(spec == "nothing"){
    document.getElementById("checkbx").style.display = "none";
    document.getElementById("param").style.display = "none";
    return;
  }

  document.getElementById("checkbx").style.display = "inline";
  document.getElementById("param").style.display = "inline";

  // document.getElementById("spec_prep").value = JSON.stringify(spec_preproc,null,'\t');
  document.getElementById("spec").value = JSON.stringify(spec,null,'\t');

  var preproc = false;/* hide for now */  //document.getElementById(preprocessing).checked;
  var param = document.getElementById(sel_param).value;

  var str = document.getElementById(inpText).value;
  if (str.length == 0) {
    document.getElementById(outDiv).innerHTML = "No input provided.";
  }else {
      // try {

        document.getElementById(outDiv).innerHTML = ""; // clear out previouscost analysis results or error messages
        var p =  [];
        var names = [];
        var num_terms = 0;

        [p , names, num_terms] = mode(str, spec, outDiv);

        if(preproc == true){
          [p_p , names_p, num_terms_p] = mode(str, spec_preproc, outDiv);

          names_p = names_p.map((curr) => curr + "_preproc.");
          p = p.concat(p_p);
          names = names.concat(names_p);
        }

        var results = compute_values(p, num_terms);
        Plotly.purge("myPlot"); // clear out possible old plot
        if(num_terms >1){
          /*if(param == "nothing"){
            plot3d(cost_analyzed, names, results);
          }else */if(param == "numbits"){
            plotslider(cost_analyzed, names, results.map((row,i)=> transpose(results[i])), "# of bits: ", "# of tiles (board width)");
          }else{
            plotslider(cost_analyzed, names, results, "# of bits: ", "# of tiles (board width)");
          }
        }else{
          plot2d(cost_analyzed, names, results);
        }
      // }catch (err) {
      //   document.getElementById(outDiv).innerHTML = err.message;
      // }
    }
}

module = {}; // Avoid error from json-stringify-pretty-compact below.
