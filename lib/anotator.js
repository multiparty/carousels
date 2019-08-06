
class Expression{
  constructor(id, type, body, arg, start, end, parent, metric, results) {
    this.id = id;
    this.type = type;
    this.body = body;
    this.arg = arg;
    this.start = start;
    this.end = end;
    this.parent = parent;
    this.metric = metric;
    this.results = results;
  }
}


window.onload = function (){
  var x = new Expression({id: '5'});
  x.metric =
  console.log("hello");
  console.log(x);
}

module = {};
