var size = 25;

function linspace(start, end, step){
  var x = [];
  for(var j = start; j <= end; j+=step)
    x.push(j);
  return x;
}


function plot(result){
  // $('code').each(function(){ $(this).html(($(this).html().trim()));});
  // $('textarea').each(function(){ $(this).text(($(this).text().trim()));});

}

function demo(specText, inpText, outDiv) {

  var spec = costs[document.getElementById(specText).value];
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

        var p = carousels.parsePoly(bbl_result[Object.keys(bbl_result)[0]]);
        var ran = linspace(1,size,1);
        var num_terms = (Object.keys(p.terms)[0].replace(',','')).length;

        var result = [];
        for(var i = 1; i <= size; i++){

          result[i-1] = ran.map(function (b){ return polynomium.evaluate(p, {"b": b, "n": i});});

          if(num_terms <=1){
            result = result[0];
            i = size+1;
          }
        }
        plot(result);

      }catch (err) {
        document.getElementById(outDiv).innerHTML = err.message;
      }
    }
}

module = {}; // Avoid error from json-stringify-pretty-compact below.
