const math = require('./../analyze/math.js');

// escape HTML special characters
const escape = function (text, html) {
  if (html) {
    text = text.replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&&/g, '&amp;&amp;')
      .replace(/\\/g, '\\');
  }
  return text;
};
const emph = function (text, html) {
  if (html) {
    text = '<emph>' + escape(text, html) + '</emph>';
  }
  return text;
};
const heading = function (text, html) {
  if (html) {
    text = '<h4>' + escape(text, html) + '</h4>';
  }
  return text;
};
const spaceIt = function (count, html) {
  const space = html ? '&nbsp;' : ' ';
  let result = '';
  for (let i = 0; i < count; i++) {
    result += space;
  }
  return result;
};

// Symbolic Output Class
function SymbolicOutput(analyzer) {
  this.analyzer = analyzer;

  // system of symbolic math equations
  this.symbolicSystem = [];
  this._extractSymbolicSystem(this.analyzer.functionMetricAbstractionMap.scopes[0]); // metric abstractions
  this._extractSymbolicSystem(this.analyzer.functionReturnAbstractionMap.scopes[0]); // return type abstractions
  this._extractSymbolicSystem(this.analyzer.loopAbstractions); // all loop abstractions
  this._extractAndSortParameters();
}

// Build a symbolic system of equations that can be evaluated by our mathjs wrapper
SymbolicOutput.prototype._extractSymbolicSystem = function (abstractionScope) {
  for (let funcName in abstractionScope) {
    if (!Object.prototype.hasOwnProperty.call(abstractionScope, funcName)) {
      continue;
    }

    const tmp = abstractionScope[funcName];
    const functionAbstractions = Array.isArray(tmp) ? tmp : [tmp];
    for (let i = 0; i < functionAbstractions.length; i++) {
      const absStr = functionAbstractions[i].mathSymbol.toString();
      const closedFormStr = this.analyzer.abstractionToClosedFormMap[absStr].toString();
      this.symbolicSystem.push(absStr + ' = ' + closedFormStr);
    }
  }
};

SymbolicOutput.prototype._extractAndSortParameters = function () {
  // put all parameters here
  this.parameters = [];
  for (let parameter in this.analyzer.parameters) {
    if (!Object.prototype.hasOwnProperty.call(this.analyzer.parameters, parameter)) {
      continue;
    }

    this.parameters.push(this.analyzer.parameters[parameter]);
  }

  // sort parameters by kind then number
  this.parameters.sort(function (p1, p2) {
    p1 = p1.mathSymbol.toString();
    p2 = p2.mathSymbol.toString();

    const m1 = p1.match(/^([a-zA-Z]+)([0-9]+)$/);
    const m2 = p2.match(/^([a-zA-Z]+)([0-9]+)$/);
    if (m1 == null || m2 == null) {
      return m2 != null ? -1 : (m1 != null ? 1 : p1.localeCompare(p2));
    }

    // if parameters are on the form <letterPrefix><numberSuffix>
    // sort by string order on letterPrefix then numeric order or numberSuffix
    const prefix1 = m1[1];
    const prefix2 = m2[1];
    const prefixCmp = prefix1.localeCompare(prefix2);
    if (prefixCmp !== 0) {
      return prefixCmp;
    }

    const suffix1 = m1[2];
    const suffix2 = m2[2];
    return parseInt(suffix1) - parseInt(suffix2);
  });
};

// dump parameter in a pretty format
SymbolicOutput.prototype.dumpParameters = function (html) {
  html = html == null ? true : html;
  const newline = html ? '<br/>' : '\n';

  // dump formatted parameters
  return this.parameters.map(function (parameter) {
    const symbol = emph(parameter.mathSymbol.toString(), html);
    const description = escape(parameter.description, html);
    return symbol + ': ' + description;
  }).join(newline + newline);
};

// get all function names in the top-level scope that were analyzed
SymbolicOutput.prototype.getFunctionNames = function () {
  const functions = [];
  for (let funcName in this.analyzer.functionMetricAbstractionMap.scopes[0]) {
    if (Object.prototype.hasOwnProperty.call(this.analyzer.functionMetricAbstractionMap.scopes[0], funcName)) {
      functions.push(funcName);
    }
  }
  return functions;
};

// dump all symbolic abstraction functions including their name and parameters, their closed form, and
// description of them and their parameters
SymbolicOutput.prototype.dumpFunctionAbstractions = function (html) {
  html = html == null ? true : html;
  const newline = html ? '<br/>' : '\n';

  let dump = [];
  const functions = this.getFunctionNames();
  for (let i = 0; i < functions.length; i++) {
    const funcName = functions[i];
    const metricAbstraction = this.analyzer.functionMetricAbstractionMap.scopes[0][funcName];
    const returnTypeAbstraction = this.analyzer.functionReturnAbstractionMap.scopes[0][funcName];

    dump.push(heading(funcName, html));
    dump = dump.concat(this.dumpAbstraction(metricAbstraction, html));
    dump = dump.concat(this.dumpAbstraction(returnTypeAbstraction, html));
    dump.push('');
  }

  return dump.join(newline);
};

// dump all symbolic abstractions for loops, in a similar format to the above
SymbolicOutput.prototype.dumpLoopAbstractions = function (html) {
  html = html == null ? true : html;
  const newline = html ? '<br/>' : '\n';

  let dump = [];
  for (let loopName in this.analyzer.loopAbstractions) {
    if (!Object.prototype.hasOwnProperty.call(this.analyzer.loopAbstractions, loopName)) {
      continue;
    }

    const loopAbstractions = this.analyzer.loopAbstractions[loopName];
    dump.push(heading(loopName, html));
    for (let i = 0; i < loopAbstractions.length; i++) {
      dump = dump.concat(this.dumpAbstraction(loopAbstractions[i], html));
    }
    dump.push('');
  }

  return dump.join(newline);
};

// format a single abstraction into human readable form
SymbolicOutput.prototype.dumpAbstraction = function (functionAbstraction, html) {
  const tab = html ? '&nbsp;&nbsp;&nbsp;&nbsp;' : '\t';

  const dump = [];
  if (functionAbstraction != null) {
    const absStr = functionAbstraction.mathSymbol.toString();
    const closedFormStr = this.analyzer.abstractionToClosedFormMap[absStr].toString();
    const simplClosedForm = math.simplify(this.analyzer.abstractionToClosedFormMap[absStr]).toString();

    dump.push(tab + emph(functionAbstraction.description, html));
    dump.push(tab + escape(absStr + ' = ' + closedFormStr, html));
    dump.push(tab + spaceIt(absStr.length, html) + escape(' = ' + simplClosedForm, html));
    dump.push('');
  }
  return dump;
};

// evaluate the given abstraction given values for parameters
SymbolicOutput.prototype.evaluate = function (callExpression, evaluationPoints, parametersValues) {
  return math.evaluate(callExpression, evaluationPoints, this.symbolicSystem.concat(parametersValues));
};

module.exports = SymbolicOutput;