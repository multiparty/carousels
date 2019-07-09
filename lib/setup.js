
function demo(specText, sel_param, inpText, outDiv) {
  var cost_analyzed = document.getElementById(specText).value;
  var param = document.getElementById(sel_param).value;

  var spec = costs[cost_analyzed];
  if(spec == "nothing")
    return;
  document.getElementById("spec").value = JSON.stringify(spec,null,'\t');

  var str = document.getElementById(inpText).value;
  if (str.length == 0) {
    document.getElementById(outDiv).innerHTML = "No input provided.";
  }else {
      try {

        for (var op in spec){
          window.spec[op] = carousels.parsePoly(spec[op]);
        }
        Babel.registerPlugin('metric', createMetric(window.spec));

        var bbl = Babel.transform(str, {plugins: ['metric']});
        var bbl_result = bbl.ast.program.results;
        document.getElementById(outDiv).innerHTML = stringify(bbl_result, {maxLength:120}).trim();

        var p =  [];
        var names = [];
        var num_terms = 0;

        [p , names, num_terms] = parse_values(bbl_result);
        var results = compute_values(p, num_terms); // fix n
        Plotly.purge("myPlot");
        
        if(num_terms >1){
          if(param == "nothing"){
            plot3d(cost_analyzed, names, results);
          }else if(param == "numbits"){
            plotslider(cost_analyzed, names, [transpose(results[0]), transpose(results[1])], "# of bits: ", "# of parties");
          }else{
            plotslider(cost_analyzed, names, results, "# of parties: ", "# of bits");
          }
        }else{
          plot2d(cost_analyzed, names, results);
        }
      }catch (err) {
        document.getElementById(outDiv).innerHTML = err.message;
      }
    }
}

module = {}; // Avoid error from json-stringify-pretty-compact below.
