// Module needs to be load dynamically (async) for WebAssembly to function\

Promise.all([import("../pkg/index.js"), import("./metrics.js")]).then(res => {
  rust = res[0];
  metrics = res[1];

  document.getElementById('myButton').addEventListener('click', getAST);
  document.getElementById('metric').addEventListener('click', buildPoly);

  function getAST (e) {
    e.preventDefault();
    var rust_code = document.getElementById('myTextarea').value;
    var res = rust_code.replace(/ else obliv if /gi, function(x) {
      return "else if ";
    });
    res = res.replace(/ obliv if /gi, function (x) {
      return "\nlet __obliv = !__obliv;\n if ";
  });
    console.log(res);
    const ir = rust.get_ast(res);
    document.getElementById('result').innerHTML  = JSON.stringify(JSON.parse(ir), null, 2);
    metrics.metric_eval(ir);
  }

  var metric = [];
}).catch(console.error);
