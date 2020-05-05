const combinators = require('../../utils/combinator.js');

module.exports = function (metrics, float) {
  float = Object.assign({}, float); // make a copy

  const hasRounds = metrics.indexOf('Network Rounds') > -1;

  // matrix operations include only matrix primitives
  const matrix = {};

  // curry combinator
  const combinator = combinators.$Combinator.bind(null, metrics, float);

  // adding two matrices element wise
  matrix['elementWise'] = function (base, n, m) {
    // base \in addf, multf, divf
    const comb = combinator('(' + n + ')*(' + m + ')*$' + base + '$');
    if (hasRounds) {
      comb['Network Rounds'] = float[base]['Network Rounds'];
    }
    return comb;
  };

  // multiplying two matrices
  matrix['mult'] = function (n, m, k) {
    const comb = combinator('(' + n + ')*(' + m + ')*(' + k + ')*($addf$ + $multf$)');
    if (hasRounds) {
      comb['Network Rounds'] = float['multf']['Network Rounds'] + ' + (' + m + ')*(' + float['addf']['Network Rounds'] + ')';
    }
    return comb;
  };

  // vector inner product
  matrix['prod'] = function (n) {
    const comb = combinator('(' + n + ')*($addf$ + $multf$)');
    if (hasRounds) {
      comb['Network Rounds'] = float['multf']['Network Rounds'] + ' + (' + n + ')*(' + float['addf']['Network Rounds'] + ')';
    }
    return comb;
  };

  // determinant evaluation
  const det = function (n) {
    const comb = combinator('(' + n + ' - 1)*$divf$ + ((' + n + ' + 2)*(' + n + ' - 1)/2)*$multf$ + (' + n + ')*(' + n + ')*(' + n + ')*$addf$ + (' + n + ' - 1)*$multf$');
    if (hasRounds) {
      comb['Network Rounds'] = '(' + n + ' - 1)*(' + float['divf']['Network Rounds'] + ') + (' +
        n + ')*(' + float['multf']['Network Rounds'] + ') + (' +
        n + ')*(' + n + ')*(' + float['addf']['Network Rounds'] + ') + (' +
        n + ' - 1)*(' + float['multf']['Network Rounds'] + ')';
    }
    return comb;
  };

  // Matrix inversion
  matrix['inv'] = function (n) {
    float['det(n)'] = det(n);
    float['det(n-1)'] = det(n + ' - 1');
    const comb = combinator('$det(n)$ + (' + n + ')*(' + n + ')*$det(n-1)$ + (' + n + ')*(' + n + ')*$multf$ + $divf$');
    if (hasRounds) {
      comb['Network Rounds'] = float['det(n)']['Network Rounds'] + ' + ' + float['divf']['Network Rounds'] + ' + ' + float['addf']['Network Rounds'];
    }
    return comb;
  };

  return matrix;
};
