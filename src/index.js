const babel = require('babel-core');
const polynomium = require('polynomium');
const analysis = require('./analysis');

function analyzeCode(code) {
    var analyzed = babel.transform(code, {plugins: [analysis]});
    return analyzed.ast.program.costObject;
}

module.exports = analyzeCode;
