const fs = require('fs');
const types = require('babel-types');

var ts = {"types":[]};
for (var t in types) {
  if (t[0].toUpperCase() == t[0] && t.indexOf("_") == -1 && t.toUpperCase() != t)
    ts["types"].push(t);
}

fs.writeFile('babel-types.json', JSON.stringify(ts, null, "  "), function () {});
