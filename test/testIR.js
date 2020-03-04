const StringifiyVisitor = require('../src/analyze/helperVisitors/stringify.js');
const JSONIR = require('./' + process.argv[2]);
console.log(new StringifiyVisitor().start(JSONIR));