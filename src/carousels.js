const babel = require('babel-core');
const polynomium = require('polynomium');
const analysis = require('./analysis');
const babylon = require('babylon');

function analyzeCode(code, costDefinition) {

    var options = {plugins: [analysis]};
    const ast = babylon.parse(code, { allowReturnOutsideFunction: true });

    ast.program.costDefinition = costDefinition;

    var analyzed = babel.transformFromAst(ast, code, options);

    // polynomium object
    var costs = analyzed.ast.program.costObject;
    for (var f in costs) {
        costs[f].cost = costs[f].cost.toString();
    }
    return costs;
}

module.exports = analyzeCode;
