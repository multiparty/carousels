const babel = require('babel-core');
const polynomium = require('polynomium');
const analysis = require('./analysis');

function analyzeCode(code) {
    var analyzed = babel.transform(code, {plugins: [analysis]});
    // polynomium object
    var costs = analyzed.ast.program.costObject;
    for (var f in costs) {
        costs[f] = costs[f].toString();
    }
    return costs;
}

module.exports = analyzeCode;
