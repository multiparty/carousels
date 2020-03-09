const StringifyVisitor = require('../src/analyze/helpers/stringify.js');
const JSONIR = require('./' + process.argv[2]);
console.log(new StringifyVisitor(null, false).start(JSONIR));