const math = require('../../analyze/math.js');

// takes a high level description string referring to other primitives (using $..$ syntax)
// and expands it to apply to every metric
const plugIntoExpression = function (metric, primitives, exprParts) {
  const str = [];
  for (let i = 0; i < exprParts.length; i++) {
    const part = exprParts[i];
    if (i % 2 === 0) {
      str.push(part);
    } else {
      str.push('(' + primitives[part][metric] + ')');
    }
  }
  return str.join('');
};
const _combinator = function (metrics, primitives, expr) {
  const result = {};
  const exprParts = expr.split('$');
  for (let i = 0; i < metrics.length; i++) {
    const key = metrics[i];
    result[key] = plugIntoExpression(key, primitives, exprParts);
  }
  return result;
};
const $Combinator = function (metrics, primitives, expr, key) {
  if (key === undefined) {
    return _combinator(metrics, primitives, expr);
  } else {
    return _combinator([key], primitives, expr)[key];
  }
};

// take a function that performs some modification / deduction on metric
// and return a new object where every entry is the result of applying the function
// to that entry's original value (similar to a lazy map).
const mapCombinator = function (metrics, func) {
  const result = {};
  for (let i = 0; i < metrics.length; i++) {
    const key = metrics[i];
    result[key] = function () {
      return func.apply(this, arguments);
    }
  }
  return result;
};

module.exports = {
  $Combinator: $Combinator,
  mapCombinator: mapCombinator
};