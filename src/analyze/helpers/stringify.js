const IRVisitor = require('../../ir/visitor.js');

// Code Styling
const COLORS = {
  keyword: '#FF6600',
  identifier: '#FFBF00',
  literal: '#578E33',
  annotation: '#2777B3',
  comment: '#979797',
  plain: '#DDDDDD',
  background: '#2E2E2E',
  error: '#B90E0A'
};

// Create new debugging visitor pattern
// intermediateResults is optional,
// if not provided, this will just stringifiy the code
function StringifyVisitor(intermediateResults, HTML) {
  IRVisitor.call(this);

  this.hasErrored = false;
  this.intermediateResults = intermediateResults;
  this.shouldAnnotate = this.intermediateResults !== null;
  this.annotateNewLine = this.shouldAnnotate ? '\n' : '';
  this.HTML = HTML !== false;
  this.INDENT = this.HTML ? '&nbsp;&nbsp;' : '  ';
}

// inherit IRVisitor
StringifyVisitor.prototype = Object.create(IRVisitor.prototype);

// Pretty formatting
StringifyVisitor.prototype.format = function (type, text) {
  if (type === 'comment' && !this.shouldAnnotate) {
    return '';
  }

  // If display encoding is not HTML, do not color format
  if (this.HTML) {
    // Format color using <span>
    if (type === 'literal') {
      text = this.escape(text);
    }
    text = '<span style="color:' + COLORS[type] + ';">' + text + '</span>'
  }
  return text;
};
StringifyVisitor.prototype.escape = function (text) {
  if (this.HTML) {
    text = text.replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&&/g, '&amp;&amp;')
      .replace(/\\/g, '\\');
  }
  return text;
};
StringifyVisitor.prototype.finalizeFormat = function (text) {
  if (this.HTML) {
    text = text.replace(/\n/g, '<br/>');
    text = '<div class="debugging" style=\'color: ' + COLORS.plain + '; background-color: ' + COLORS.background + '; padding: 30px; ' +
      'width: min-content; min-width: 90%; white-space: nowrap; font-family: "Courier New", Courier, monospace\'>' + text + '</div>';
  }
  return text;
};
StringifyVisitor.prototype.annotationIndent = function (text) {
  if (this.shouldAnnotate) {
    return this.indent(text);
  }
  return text;
};
StringifyVisitor.prototype.indent = function (text) {
  if (text.trim().length === 0) {
    return '';
  }
  return this.INDENT + text.replace(/\n/g, '\n' + this.INDENT);
};

// Embed annotation into the given code
const DISPLAY_ATTRIBUTES = ['returnAbstraction', 'metricAbstraction']
StringifyVisitor.prototype.stringifyAnnotation = function (annotation) {
  // Build the annotation str
  if (annotation.result == null && annotation.error == null) {
    // empty annotation
    return '// {{ null }}';
  } else if (annotation.result != null) {
    // output annotation
    const type = annotation.result.type.toString();
    const metric = annotation.result.metric.toString();
    let str = '// {{ type: ' + this.escape(type)  + ',\n// ' + this.INDENT + ' metric: ' + this.escape(metric);
    for (let i = 0; i < DISPLAY_ATTRIBUTES.length; i++) {
      const attr = DISPLAY_ATTRIBUTES[i];
      if (annotation.result[attr]) {
        str += '\n// ' + this.INDENT + ' ' + attr + ': ' + this.escape(annotation.result[attr]);
      }
    }
    str += ' }}';
    return str;
  } else if (annotation.error != null) {
    // error annotation
    this.hasErrored = true;
    let errorStr = annotation.error.toString();
    errorStr = this.escape(errorStr);
    errorStr = errorStr.replace(/\n/g, '\n// ' + this.INDENT + ' ');
    return this.format('error', '// {{ error: ' + errorStr + ' }}');
  }
};
StringifyVisitor.prototype.embedAnnotation = function (node, result, annotation) {
  // Error cases
  if (this.hasErrored) {
    return result;
  }
  if (annotation == null || (node !== annotation.node && (node != null || annotation.node != null) && annotation.error == null)) {
    this.hasErrored = true;
    annotation = {
      error: new Error('Inconsistency in traversal ordering between pretty printer and analyser!')
    };
  }
  if (node !== annotation.node && (node != null || annotation.node != null)) {
    this.intermediateResults.unshift(annotation);
    annotation = {};
  }

  // Empty
  if (result === '' && annotation.result == null && annotation.error == null) {
    return '';
  }

  // Sequence
  const annotationStr = this.stringifyAnnotation(annotation);
  if (Array.isArray(node)) {
    if (result.trim === '') { // empty sequence
      return this.format('annotation', annotationStr);
    }
    return result + '\n\n' + this.format('annotation', annotationStr);
  }

  // Real IRNode
  return this.format('annotation', annotationStr) + this.annotateNewLine + result;
};

// Make sure newlines are HTML compatible
StringifyVisitor.prototype.start = function () {
  let result = IRVisitor.prototype.start.apply(this, arguments);
  return this.finalizeFormat(result);
};

// default return is ''
StringifyVisitor.prototype.visit = function (node, withAnnotation) {
  const result = IRVisitor.prototype.visit.apply(this, arguments) || '';
  if (withAnnotation !== false && this.intermediateResults) {
    const annotation = this.intermediateResults.shift();
    return this.embedAnnotation(node, result, annotation);
  }
  return result;
};

// Override visit functions
StringifyVisitor.prototype.visitTypeNode = function (node) {
  const type = node.type;
  const secret = node.secret;
  const dependentTypeResult = this.visit(node.dependentType, false);

  const dependentString = dependentTypeResult ? '<' + dependentTypeResult + '>' : '';
  if (secret) {
    return this.escape('Possession<' + type + dependentString + '>');
  } else {
    return this.escape(type + dependentString);
  }
};
StringifyVisitor.prototype.visitCarouselsAnnotation = function (node) {
  const rustString = this.escape(node.rustString);
  return this.format('keyword', 'carousels!') + '(' + rustString + ')\n';
};
StringifyVisitor.prototype.visitFunctionDefinition = function (node) {
  const nameResult = this.visit(node.name, false);
  let parametersResults = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parametersResults.push(this.annotationIndent(this.visit(node.parameters[i], true, false)));
  }
  let returnTypeResult = this.annotationIndent(this.visit(node.returnType));
  const bodyResult = this.visit(node.body);

  return this.format('keyword', 'function ') + this.format('identifier', nameResult) + '(' +
    this.annotateNewLine + parametersResults.join(this.annotateNewLine + ', ' + this.annotateNewLine) +
    this.annotateNewLine +'): ' +
    this.annotateNewLine + returnTypeResult + '\n' +
    '{\n' +
    this.indent(bodyResult) + '\n' +
    '}\n';
};
StringifyVisitor.prototype.visitReturnStatement = function (node) {
  let expressionResult = this.annotationIndent(this.visit(node.expression));
  return this.format('keyword', 'return ') + this.annotateNewLine + expressionResult;
};
StringifyVisitor.prototype.visitVariableDefinition = function (node, withAnnotation, withLet) {
  const nameResult = this.visit(node.name, false);
  let typeResult = this.annotationIndent(this.visit(node.type));
  let assignmentResult = this.annotationIndent(this.visit(node.assignment, true, false));

  let str = withLet !== false ? this.format('keyword', 'let ') : '';
  str += this.format('identifier', nameResult);
  if (typeResult !== '') {
    str += ': ' + this.annotateNewLine + typeResult;
  }
  if (assignmentResult !== '') {
    str += this.annotateNewLine + ' = ' + this.annotateNewLine + assignmentResult;
  }
  return str;
};
StringifyVisitor.prototype.visitForEach = function (node) {
  let rangeResult = this.annotationIndent(this.visit(node.range));
  let iteratorResult = this.annotationIndent(this.visit(node.iterator));
  const bodyResult = this.visit(node.body);

  return this.format('keyword', 'foreach ') + ' (' + this.annotateNewLine +
    iteratorResult + this.annotateNewLine + (this.annotateNewLine === '' ? ' ' : '') +
    this.format('keyword', 'in ')  + this.annotateNewLine +
    rangeResult + this.annotateNewLine +
    ') {\n' +
    this.indent(bodyResult) + '\n' +
    '}';
};
StringifyVisitor.prototype.visitFor = function (node) {
  let initialResult = this.visit(node.initial);
  let conditionResult = this.visit(node.condition);
  let incrementResult = this.visit(node.increment);
  let bodyResult = this.visit(node.body);

  return this.format('keyword', 'for') + ' (\n' +
    this.indent(initialResult) +
    '\n;\n' +
    this.indent(conditionResult) +
    '\n;\n' +
    this.indent(incrementResult) +
    '\n) {\n' +
    this.indent(bodyResult) +
    '\n}';
};
StringifyVisitor.prototype.visitVariableAssignment = function (node, withAnnotation, withEquals) {
  const nameResult = this.visit(node.name, false);
  const expressionResult = this.annotationIndent(this.visit(node.expression));
  if (withEquals === false) {
    return expressionResult;
  } else {
    return this.format('identifier', nameResult) + ' = ' + this.annotateNewLine + expressionResult;
  }
};
StringifyVisitor.prototype.visitIf = function (node) {
  let conditionResult = this.annotationIndent(this.visit(node.condition));
  const ifBodyResult = this.visit(node.ifBody);
  const elseBodyResult = this.visit(node.elseBody);

  return this.format('keyword', 'if') + ' (' + this.annotateNewLine +
    conditionResult + this.annotateNewLine +
    ') {\n' +
    this.indent(ifBodyResult) + '\n' +
    '} ' + this.format('keyword', 'else') + ' {\n' +
    this.indent(elseBodyResult) + '\n' +
    '}';
};
StringifyVisitor.prototype.visitOblivIf = function (node) {
  let conditionResult = this.annotationIndent(this.visit(node.condition));
  const ifBodyResult = this.visit(node.ifBody);
  const elseBodyResult = this.visit(node.elseBody);

  return this.format('keyword', 'obliv if') + ' (' + this.annotateNewLine +
    conditionResult + this.annotateNewLine +
    ') {\n' +
    this.indent(ifBodyResult) + '\n' +
    '} ' + this.format('keyword', 'else') + ' {\n' +
    this.indent(elseBodyResult) + '\n' +
    '}';
};
StringifyVisitor.prototype.visitLiteralExpression = function (node) {
  const type = node.type; // "str", "number", "bool"
  const value = node.value; // string

  if (type === 'str') {
    return this.format('literal', '"' + value + '"');
  }

  return this.format('literal', value);
};
StringifyVisitor.prototype.visitNameExpression = function (node) {
  const name = node.name;
  return this.format('identifier', name);
};
StringifyVisitor.prototype.visitDirectExpression = function (node) {
  let operator = this.escape(node.operator);
  let str = '(' + this.annotateNewLine;
  const operands = [];
  for (let i = 0; i < node.operands.length; i++) {
    operands.push(this.annotationIndent(this.visit(node.operands[i])));
  }
  str += operands.join(this.annotateNewLine + ' ' + operator + ' ' + this.annotateNewLine);
  str += this.annotateNewLine + ')';

  //if (operator === '~' || operator === '!') {
  //str = operator + str;
  //}
  return str;
};
StringifyVisitor.prototype.visitParenthesesExpression = function (node) {
  const expressionResult = this.annotationIndent(this.visit(node.expression));
  return '(' + this.annotateNewLine + expressionResult + this.annotateNewLine + ')';
};
StringifyVisitor.prototype.visitArrayAccess = function (node) {
  const arrayResult = this.annotationIndent(this.visit(node.array));
  const indexResult = this.annotationIndent(this.visit(node.index));
  return this.format('comment', '// ARRAY ACCESS') + this.annotateNewLine +
    arrayResult + this.annotateNewLine +
    this.annotationIndent('[') + this.annotateNewLine +
    indexResult + this.annotateNewLine +
    this.annotationIndent(']');
};
StringifyVisitor.prototype.visitRangeExpression = function (node) {
  const startResult = this.annotationIndent(this.visit(node.start));
  const endResult = this.annotationIndent(this.visit(node.end));
  const incrementResult = this.annotationIndent(this.visit(node.increment));
  let str = '[' + this.annotateNewLine +
    startResult + this.annotateNewLine +
    ' : ' + this.annotateNewLine +
    endResult + this.annotateNewLine;

  if (incrementResult.trim() !== '') {
    str += ' : ' + this.annotateNewLine +
      incrementResult + this.annotateNewLine;
  }

  str += ']';
  return str;
};
StringifyVisitor.prototype.visitSliceExpression = function (node) {
  const arrayResult = this.annotationIndent(this.visit(node.array));
  const rangeResult = this.annotationIndent(this.visit(node.range));
  return this.format('comment', '// ARRAY SLICE') + this.annotateNewLine +
    arrayResult + this.annotateNewLine +
    rangeResult;
};
StringifyVisitor.prototype.visitArrayExpression = function (node) {
  let str = '[' + this.annotateNewLine;
  for (let i = 0; i < node.elements.length; i++) {
    const element = this.annotationIndent(this.visit(node.elements[i]));

    str += element + this.annotateNewLine;
    if (i < node.elements.length - 1) {
      str += ', ' + this.annotateNewLine;
    }
  }
  str += ']';
  return str;
};
StringifyVisitor.prototype.visitFunctionCall = function (node) {
  const functionResult = this.annotationIndent(this.visit(node.function));

  // Comment + name of function
  let str = this.format('comment', '// FUNCTION CALL') + this.annotateNewLine +
    functionResult + this.annotateNewLine;

  const parameters = [];
  for (let i = 0; i < node.parameters.length; i++) {
    parameters.push(this.annotationIndent(this.visit(node.parameters[i])));
  }

  if (parameters.length > 0) {
    str += this.annotationIndent('(') + this.annotateNewLine +
      parameters.join(this.annotateNewLine + ', ' + this.annotateNewLine) + this.annotateNewLine +
      this.annotationIndent(')');
  } else {
    str += this.annotationIndent('()');
  }
  return str;
};
StringifyVisitor.prototype.visitDotExpression = function (node) {
  const leftResult = this.annotationIndent(this.visit(node.left));
  const rightResult = this.annotationIndent(this.visit(node.right, false));

  return this.format('comment', '// DOT EXPRESSION') + this.annotateNewLine +
    leftResult + this.annotateNewLine +
    this.annotationIndent('.') + this.annotateNewLine +
    rightResult;
};
StringifyVisitor.prototype.visitSequence = function (nodes) {
  const statementsResults = [];
  for (let i = 0; i < nodes.length; i++) {
    statementsResults.push(this.visit(nodes[i]));
  }
  return statementsResults.join('\n');
};

module.exports = StringifyVisitor;