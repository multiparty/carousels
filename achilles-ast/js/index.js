// Module needs to be load dynamically (async) for WebAssembly to function
import("../pkg/index.js").then(rust => {
  document.getElementById('myButton').addEventListener('click', getAST);
  document.getElementById('metric').addEventListener('click', buildPoly);

  function getAST (e) {
    e.preventDefault();
    const res = rust.get_ast(document.getElementById('myTextarea').value);
    document.getElementById('result').innerHTML  = JSON.stringify(JSON.parse(res), null, 2);;
  }

  var metric = [];
  function buildPoly(e) {
    e.preventDefault();
    var IR = document.getElementById('result').innerHTML;
    IR = JSON.parse(IR);
    traverse(IR)
    document.getElementById('polynomial').innerHTML = metric;
  }
  function traverse(jsonObj) {
    if( jsonObj !== null && typeof jsonObj == "object" ) {
      Object.entries(jsonObj).forEach(([key, value]) => {
        // key is either an array index or object key
        traverse(value);
      });
    }
    else {
      // jsonObj is a number or string
      metric.push(jsonObj);
    }
  }
}).catch(console.error);
