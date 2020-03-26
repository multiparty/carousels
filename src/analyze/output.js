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
  const self = this;
  this.analyzer = analyzer;

  // the parameters
  this.globalParameters = []; // [Parameter]
  this.scopeParameters = []; // [string]

  // system of symbolic math equations
  this.symbolicSystem = [];
  this.symbolicSystemMath = [];
  this._extractSymbolicSystem(this.analyzer.functionMetricAbstractionMap.scopes[0], true); // metric abstractions
  this._extractSymbolicSystem(this.analyzer.functionReturnAbstractionMap.scopes[0], false); // return type abstractions
  this.getFunctionNames().forEach(function (funcName) { // all loop abstractions
    self.analyzer.functionLoopAbstractionMap[funcName].traverse(function (loopAbstractionLevel) {
      self._extractSymbolicSystemArray(loopAbstractionLevel.abstractions, false);
    });
  });
  this._extractAndSortParameters();
}

// Build a symbolic system of equations that can be evaluated by our mathjs wrapper
SymbolicOutput.prototype._extractSymbolicSystem = function (abstractionScope, addParametersToScope) {
  for (let funcName in abstractionScope) {
    if (!Object.prototype.hasOwnProperty.call(abstractionScope, funcName)) {
      continue;
    }

    const tmp = abstractionScope[funcName];
    const functionAbstractions = Array.isArray(tmp) ? tmp : [tmp];
    this._extractSymbolicSystemArray(functionAbstractions, addParametersToScope);
  }
};
SymbolicOutput.prototype._extractSymbolicSystemArray = function (abstractions, addParametersToScope) {
  for (let i = 0; i < abstractions.length; i++) {
    const absStr = abstractions[i].mathSymbol.toString();
    const closedFormStr = this.analyzer.abstractionToClosedFormMap[absStr].toString();
    this.symbolicSystem.push(absStr + ' = ' + closedFormStr);
    this.symbolicSystemMath.push(math.parse(this.symbolicSystem[this.symbolicSystem.length - 1]));

    // add the function parameters to the scope parameters
    if (addParametersToScope) {
      abstractions[i].parameters.forEach(function (parameter) {
        const str = parameter.mathSymbol.toString();
        if (this.scopeParameters.indexOf(str) === -1) {
          this.scopeParameters.push(parameter);
        }
      }, this);
    }
  }
};

SymbolicOutput.prototype._extractAndSortParameters = function () {
  // put all parameters here
  const parameters = [];
  for (let parameter in this.analyzer.parameters) {
    if (!Object.prototype.hasOwnProperty.call(this.analyzer.parameters, parameter)) {
      continue;
    }

    parameters.push(this.analyzer.parameters[parameter]);
  }

  // sort parameters by kind then number
  const compare = function (p1, p2) {
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
  };

  // only display useful global parameters
  this.globalParameters = parameters.filter(this._parameterIsUsed, this).sort(compare);
  this.scopeParameters = this.globalParameters.concat(this.scopeParameters).sort(compare)
    .map(function (parameter) {
      return parameter.mathSymbol.toString();
    })
    .filter(function (parameter, index, arr) {
      return index === 0 || (arr[index-1] !== parameter);
    })
    .filter(function (parameter) {
      // make metric parameters zero initially (this is ignored when an abstraction is used with a different argument)
      if (parameter.startsWith('m')) {
        this.symbolicSystem.push(parameter + ' = 0');
        return false;
      }
      return true;
    }, this);
};

SymbolicOutput.prototype._parameterIsUsed = function (parameter) {
  // look for this parameter in all the symbolic equations to see if it appears as a *free* variable
  parameter = parameter.mathSymbol.toString();
  for (let i = 0; i < this.symbolicSystemMath.length; i++) {
    const equation = this.symbolicSystemMath[i];
    if (math.variableIsUsed(parameter, equation)) {
      return true;
    }
  }
  return false;
};

// dump parameter in a pretty format
SymbolicOutput.prototype.dumpParameters = function (html) {
  html = html == null ? true : html;
  const newline = html ? '<br/>' : '\n';
  return this._dumpParameters(this.globalParameters, html).join(newline + newline);
};
SymbolicOutput.prototype._dumpParameters = function (parameters, html) {
  // dump formatted parameters
  return parameters.map(function (parameter) {
    const symbol = emph(parameter.mathSymbol.toString(), html);
    const description = escape(parameter.description, html);
    return symbol + ': ' + description;
  });
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

// dump all the function and loop abstractions
SymbolicOutput.prototype.dumpAbstractions = function (html) {
  const self = this;
  html = html == null ? true : html;
  const newline = html ? '<br/>' : '\n';

  let dump = [];
  const functions = this.getFunctionNames();
  for (let i = 0; i < functions.length; i++) {
    // create a section for this function
    const funcName = functions[i];
    dump.push(heading(funcName, html));
    dump.push('');

    // display metric and return type abstractions
    const metricAbstraction = this.analyzer.functionMetricAbstractionMap.scopes[0][funcName];
    const returnTypeAbstraction = this.analyzer.functionReturnAbstractionMap.scopes[0][funcName];
    dump = dump.concat(this.dumpAbstraction(metricAbstraction, html));
    dump = dump.concat(this.dumpAbstraction(returnTypeAbstraction, html));

    // display loop abstractions for loops inside this function
    const tab = html ? '&nbsp;&nbsp;&nbsp;&nbsp;' : '\t';
    const indentation = [tab];
    const loopAbstractionsTreeTracker = this.analyzer.functionLoopAbstractionMap[funcName];
    if (!loopAbstractionsTreeTracker.empty()) {
      loopAbstractionsTreeTracker.traverse(function (loopAbstractionsLevel) {
        const indentationStr = indentation.join('');
        dump.pop(); // remove extra empty line
        dump.push(heading(indentationStr + 'Loop "' + loopAbstractionsLevel.loopName + '"', html));

        for (let i = 0; i < loopAbstractionsLevel.abstractions.length; i++) {
          const loopAbstraction = loopAbstractionsLevel.abstractions[i];
          dump = dump.concat(self.dumpAbstraction(loopAbstraction, html).map(function (line) {
            return indentationStr + line;
          }));
        }

        indentation.push(tab);
      }, function () {
        indentation.pop();
      });
    }
  }

  return dump.join(newline);
};

// format a single abstraction into human readable form
SymbolicOutput.prototype.dumpAbstraction = function (abstraction, html) {
  const tab = html ? '&nbsp;&nbsp;&nbsp;&nbsp;' : '\t';

  const dump = [];
  if (abstraction != null) {
    const absStr = abstraction.mathSymbol.toString();
    const closedFormStr = this.analyzer.abstractionToClosedFormMap[absStr].toString();
    const simplClosedForm = math.simplify(this.analyzer.abstractionToClosedFormMap[absStr]).toString();

    dump.push(tab + emph(abstraction.description, html));
    dump.push(tab + escape(absStr + ' = ' + closedFormStr, html));
    dump.push(tab + spaceIt(absStr.length, html) + escape(' = ' + simplClosedForm, html));
    this._dumpParameters(abstraction.parameters, html).forEach(function (line) {
      dump.push(tab + line);
    });
    dump.push('');
  }
  return dump;
};

// evaluate the given abstraction given values for parameters
SymbolicOutput.prototype.evaluate = function (callExpression, evaluationPoints, parametersValues) {
  return math.evaluate(callExpression, evaluationPoints, this.symbolicSystem.concat(parametersValues));
};

module.exports = SymbolicOutput;