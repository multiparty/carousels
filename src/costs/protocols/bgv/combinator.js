// takes a high level description string referring to other primitives (using $..$ syntax)
// and expands it to apply to every metric
const func = function (key, primitives, exprsParts, node, metric, args, childrenType, childrenMetric) {
  const result = [];
  for (let i = 0; i < exprsParts.length; i++) {
    // one index in the mixed metric at a time
    // now at index i
    const exprParts = exprsParts[i];
    const str = [];
    for (let j = 0; j < exprParts.length; j++) {
      const part = exprParts[j];
      if (j % 2 === 0) {
        str.push(part);
      } else {
        const partMetric = primitives[part][key](node, metric, args, childrenType, childrenMetric);
        str.push('(' + partMetric[i] + ')');
      }
    }
    result.push(str.join(''));
  }
  return result;
};

const $Combinator = function (metrics, primitives, exprs) {
  const exprsParts = exprs.map(function (expr) {
    return expr.split('$');
  });

  const result = {};
  for (let i = 0; i < metrics.length; i++) {
    const key = metrics[i];
    result[key] = func.bind(null, key, primitives, exprsParts);
  }
  return result;
};

module.exports = $Combinator;