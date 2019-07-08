var size = 25;

function linspace(start, end, step){
  var x = [];
  for(var j = start; j <= end; j+=step)
    x.push(j);
  return x;
}

function demo(specText, inpText, outDiv) {

  var cost_analyzed = document.getElementById(specText).value;
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

        var keys = Object.keys(bbl_result);
        var p =  [];
        var names = [];
        var num_terms = 0;
        for(var i =0; i < keys.length; i++){
          var temp = carousels.parsePoly(bbl_result[keys[i]]);
          var len = (Object.keys(temp.terms)[0].replace(',','')).length;
          num_terms = (num_terms < len)? len: num_terms;
          p.push(temp);
          names.push(keys[i]);
        }

        var ran = linspace(1,size,1);
        var results = [];
        for(var j = 0; j < p.length; j++){
          var res = [];

          for(var i = 1; i <= size; i++){
            res[i-1] = ran.map(function (b){ return polynomium.evaluate(p[j], {"b": b, "n": i});});

            if(num_terms <=1){
              res = res[0];
              i = size+1;
            }
          }
          results.push(res);
        }

        if(num_terms >1){
          plot3d(cost_analyzed, names, results);
        }else{
          plot2d(cost_analyzed, names, results);
        }
      }catch (err) {
        document.getElementById(outDiv).innerHTML = err.message;
      }
    }
}

module = {}; // Avoid error from json-stringify-pretty-compact below.
