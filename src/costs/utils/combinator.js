// takes a high level description string referring to other primitives (using $..$ syntax)
// and expands it to apply to every metric
const combinator = function (metrics, primitives, expr) {
  const result = {};
  const exprParts = expr.split('$');
  for (let i = 0; i < metrics.length; i++) {
    const key = metrics[i];
    result[key] = plugIntoExpression(key, primitives, exprParts);
  }
  return result;
};

const plugIntoExpression = function (metric, primitives, expr) {
  const str = [];
  const parts = expr.split('$');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i % 2 === 0) {
      str.push(part);
    } else {
      str.push('(' + primitives[part][metric] + ')');
    }
  }
  return str.join('');
};

module.exports = function (metrics, primitives, expr, key) {
  if (key === undefined) {
    return combinator(metrics, primitives, expr);
  } else {
    return combinator([key], primitives, expr)[key];
  }
};