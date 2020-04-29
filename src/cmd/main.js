const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const carousels = require('../index.js');
const format = require('./format.js');

// define command line arguments
yargs.option('file', {
  type: 'string',
  description: 'path to input file',
  demand: true
});
yargs.option('protocol', {
  type: 'string',
  description: 'the protocol to analyze on the given input file',
  choices: Object.keys(carousels.costs),
  demand: true
});
yargs.option('debug', {
  type: 'string',
  description: 'path to directory to dump debugging files in',
  default: undefined
});
yargs.option('evaluate', {
  type: 'string',
  description: 'name of function to evaluate cost for'
});
yargs.option('at', {
  type: 'string',
  description: 'JSON string representing points of evaluation'
});
yargs.option('verbose', {
  type: 'boolean',
  default: true,
  description: 'print intermediate symbolic system of equations and status updates'
});
yargs.option('simpl', {
  type: 'boolean',
  default: false,
  description: 'whether to simplify symbolic system before printing and evaluating'
});

// read command line arguments
const argv = yargs.argv;
const file = argv.file;
const cost = argv.protocol;
const evaluate = argv.evaluate;
const at = argv.at;
const debug = argv.debug;
const verbose = argv.verbose;
const simpl = argv.simpl;

// for verbose logging
const INFO = verbose ? console.log : function () {};

// ensure consistency
if ((evaluate && !at) || (at && !evaluate)) {
  console.log('You must provide both --evaluate and --at or neither!');
  process.exit(1);
}
if (!evaluate && !verbose && !debug) {
  console.log('Nothing to do');
  process.exit(1);
}
if (debug) {
  fs.mkdirSync(debug, {recursive: true});
}

// read input file
INFO('Reading input code...');
const inputCode = fs.readFileSync(file, 'utf8');

// create analyzer
// Create a new carousels analyzer and dump IR
carousels.promise.then(function () {
  INFO('WASM Modules loaded!');

  // find all metrics
  const metrics = carousels.costs[cost].metrics.map(function (obj) {
    return obj.title;
  });

  INFO('Parsing input code');
  let first = true;
  for (const metric of metrics) {
    // create analyzer and parse code
    const analyzer = new carousels.Analyzer('rust', inputCode);
    if (debug && first) {
      fs.writeFileSync(path.join(debug, 'ir.json'), format.formatJSON(analyzer.IR));
    }

    INFO('Analyzing metric "' + metric + '"...');
    analyzer.analyze(carousels.costs[cost], metric);
    if (debug) {
      // dump code and annotations
      fs.writeFileSync(path.join(debug, 'debug.html'), format.formatHTML(analyzer.prettyPrint()));
    }

    // simplify equations
    if (simpl) {
      analyzer.simplifyClosedForms();
    }

    // display / log symbolic outputs
    const symbolicOutput = analyzer.symbolicOutput();
    let symbolicResults = '----------------------------\nMetric "' + metric + '"\n\nAbstractions:\n';
    symbolicResults += symbolicOutput.dumpAbstractions(false);
    symbolicResults += '\n\nGlobal Parameters:';
    symbolicResults += symbolicOutput.dumpParameters(false) + '\n----------------------------\n\n';
    if (debug) {
      if (first) {
        fs.writeFileSync(path.join(debug, 'symbolic.txt'), '');
      }
      fs.appendFileSync(path.join(debug, 'symbolic.txt'), symbolicResults);
    }

    // evaluate expressions at given scope
    if (evaluate) {
      const abstractionToEvaluate = analyzer.functionMetricAbstractionMap.scopes[0][evaluate].mathSymbol.toString();
      const scope = at.split(';');
      console.log(metric, '=', symbolicOutput.evaluate(abstractionToEvaluate, scope, true));
    }

    // done with one metric
    first = false;
  }
});
