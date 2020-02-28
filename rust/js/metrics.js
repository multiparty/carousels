function demo(res) {
console.log(JSON.parse(res));
}

function metric_eval(ir){
  var ir = JSON.parse(ir);
  console.log(ir);
}

function traverse(jsonObj) {
  if( jsonObj !== null && typeof jsonObj == "object" ) {
    Object.entries(jsonObj).forEach(([key, value]) => {
      // key is either an array index or object key
      metrics.metric_eval(value);
    });
  }
  else {
    // jsonObj is a number or string
    metric.push(jsonObj);
  }
}

function buildPoly(e) {
  e.preventDefault();
  var IR = document.getElementById('result').innerHTML;
  IR = JSON.parse(IR);
  traverse(IR)
  document.getElementById('polynomial').innerHTML = metric;
}
module.exports = {
  metric_eval: metric_eval
}; // Avoid error from json-stringify-pretty-compact below.
