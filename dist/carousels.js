const babel = require('babel-core');
const analysis = require('./dist/analysis');

function analyzeCode(code) {
    var analyzed = babel.transform(code, { plugins: [analysis] });
    return analyzed;
}

module.exports = analyzeCode;