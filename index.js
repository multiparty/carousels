const babel = require('babel-core');

const analysis = require('./src/analysis');

function analyzeCode(code) {
    var analyzed = babel.transform(code, {plugins: [analysis]});
    console.log('cost: ', analyzed.ast.program.costObject)
    return analyzed;
}

module.exports = analyzeCode;
