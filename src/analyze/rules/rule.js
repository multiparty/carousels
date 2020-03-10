const MACROS = {};
MACROS['@T'] = '(<.*>)'; // ANY TYPE
MACROS['@D'] = '(' + MACROS['@T'] + '?)'; // ANY DEPENDENT TYPE
MACROS['@\'P'] = '(' + MACROS['@T'] + ',)*'; // ANY PARAMETERS FOLLOWED BY COMMA IF PARAMETERS EXISTS
MACROS['@,P'] = '(,' + MACROS['@T'] + ')*'; // ANY PARAMETERS PRECEDED BY COMMA IF PARAMETERS EXISTS
MACROS['@P'] = '(' + MACROS['@\'P'] + MACROS['@T'] + ')?'; // ANY PARAMETERS WITHOUT LEADING OR TRAILING COMMAS
MACROS['@NB'] = '(<type:(number|boolean)' + MACROS['@D'] + ',secret:(true|false)>)'; // NUMBER OR BOOLEAN

function Rule(pattern, value) {
  this.pattern = pattern;
  this.value = value;

  this.parsePattern();
}

Rule.prototype.parsePattern = function () {
  for (let macro in MACROS) {
    if (!Object.prototype.hasOwnProperty.call(MACROS, macro)) {
      continue;
    }

    const find = new RegExp(macro, 'g');
    this.pattern = this.pattern.replace(find, MACROS[macro]);
  }

  this.pattern = new RegExp('^' + this.pattern + '$');
};

Rule.prototype.appliesTo = function (expressionTypeString) {
  return this.pattern.test(expressionTypeString);
};

module.exports = Rule;