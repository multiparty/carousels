const $Combinator = require('./combinator.js');

module.exports = function (metrics, float) {
  float = Object.assign({}, float); // make a copy

  // matrix operations include only matrix primitives
  const matrix = {};

  // curry combinator
  const combinator = $Combinator.bind(null, metrics, float);

  // adding two matrices element wise
  matrix['elementWise'] = function (base, n, m) {
    // base \in addf, multf, divf
    return combinator(['$' + base + '$', '(' + n + ')*(' + m + ')*$' + base + '$', '0']);
  };

  // multiplying two matrices
  matrix['mult'] = function (n, m, k) {
    return combinator([
      '$multf$ + (' + m + ' - 1)*$addf$',
      '(' + n + ')*(' + m + ')*(' + k + ')*$multf$ + (' + n + ')*(' + m + ' - 1)*(' + k + ')*$addf$',
      '0'
    ]);
  };

  // vector inner product
  matrix['prod'] = function (n) {
    return combinator(['$multf$ + (' + n + ')*$addf$', '(' + n + ')*($addf$ + $multf$)', '0']);
  };

  // Matrix inversion
  matrix['inv'] = function (n) {
    // determinant evaluation
    const det = function (n) {
      return [
        '(' + n + ' - 1)*$divf$ + (' + n + ')*$multf$ + (' + n + ')*(' + n + ')*$addf$ + (' + n + ' - 1)*$multf',
        '(' + n + ' - 1)*$divf$ + ((' + n + ' + 2)*(' + n + ' - 1)/2)*$multf$ + (' + n + ')*(' + n + ')*(' + n + ')*$addf$ + (' + n + ' - 1)*$multf$',
        '0'
      ];
    };

    const detn = det(n);
    const detn_1 = det(n + ' - 1');
    return combinator([
      detn[0] + ' + $divf$ + $addf$',
      detn[1] + '(' + n + ')*(' + n + ')*(' + detn_1[1] + ') + (' + n + ')*(' + n + ')*$multf$ + $divf$',
      '0'
    ]);
  };

  return matrix;
};
