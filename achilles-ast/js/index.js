// Module needs to be load dynamically (async) for WebAssembly to function\

Promise.all([import("../pkg/index.js"), import("./metrics.js")]).then(res => {
  rust = res[0];
  metrics = res[1];

  document.getElementById('myButton').addEventListener('click', getAST);
  document.getElementById('metric').addEventListener('click', buildPoly);

  function getAST (e) {
    e.preventDefault();
    const ir = rust.get_ast(document.getElementById('myTextarea').value);
    document.getElementById('result').innerHTML  = JSON.stringify(JSON.parse(ir), null, 2);
    metrics.metric_eval(ir);
  }

  var metric = [];
}).catch(console.error);
