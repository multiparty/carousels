// get the number of polynomials from metric
const _u = function (metric) {
  return metric[0] + ' + 2';
};

// get the number residues from metric
const _k = function (metric) {
  return 'D - ' + metric[0] + ' + 1';
};

// max of two quantities
const max = function (q1, q2) {
  return 'max(' + q1 + ', ' + q2 + ')';
};

// parenthesise expression
const _ = function (q) {
  return '(' + q + ')';
};

// memory usage
const cipherSize = function (metric) {
  return _(_u(metric)) + ' * n * ' + _(_k(metric)) + ' * b';
};
const cipherAccess = function (metric, count) {
  return _(count) + ' * ' + _(_u(metric)) + ' * n * ' + _(_k(metric));
};

module.exports = {
  ZERO: {
    'RISK-V Instructions': {
      metric: ['0', '0', '0'],
      __absolute: true
    },
    'Total Memory': {
      metric: ['0', '0', '0'],
      __absolute: true
    },
    'Memory Access': {
      metric: ['0', '0', '0'],
      __absolute: true
    }
  },
  cadd: {
    'RISK-V Instructions': function (node, metric, args, childrenType, childrenMetric) {
      const total = _(_k(metric)) + ' * RA';
      return ['0', total, '0'];
    },
    'Total Memory': function (node, metric, args, childrenType, childrenMetric) {
      return ['0', cipherSize(metric), '0'];
    },
    'Memory Access': function (node, metric, args, childrenType, childrenMetric) {
      return ['0', cipherAccess(metric, '2'), '0'];
    }
  },
  sadd: {
    'RISK-V Instructions': function (node, metric, args, childrenType, childrenMetric) {
      const total = _(_u(metric)) + ' * ' + _(_k(metric)) + ' * RA';
      return ['0', total, '0'];
    },
    'Total Memory': function (node, metric, args, childrenType, childrenMetric) {
      return ['0', cipherSize(metric), '0'];
    },
    'Memory Access': function (node, metric, args, childrenType, childrenMetric) {
      return ['0', cipherAccess(metric, '3'), '0'];
    }
  },
  cmult: {
    'RISK-V Instructions': function (node, metric, args, childrenType, childrenMetric) {
      const total = _(_u(metric)) + ' * ' + _(_k(metric)) + ' * RM';
      return ['0', total, '0'];
    },
    'Total Memory': function (node, metric, args, childrenType, childrenMetric) {
      return ['0', cipherSize(metric), '0'];
    },
    'Memory Access': function (node, metric, args, childrenType, childrenMetric) {
      return ['0', cipherAccess(metric, '2'), '0'];
    }
  },
  smult: {
    'RISK-V Instructions': function (node, metric, args, childrenType, childrenMetric) {
      let m1 = childrenMetric && childrenMetric.operands ? childrenMetric.operands[0] : metric;
      let m2 = childrenMetric && childrenMetric.operands ? childrenMetric.operands[1] : metric;
      m1 = m1 ? m1 : metric;
      m2 = m2 ? m2 : metric;

      const k = max(_k(m1), _k(m2));
      const u1 = _(_u(m1));
      const u2 = _(_u(m2));

      const total1 = k + ' * ' + u1 + ' * ' + u2 + ' * RM';
      const total2 = '(' + u1 + ' * ' + u2 + ' + 1 - ' + u1 + ' - ' + u2 + ') * RA';
      const total = total1 + ' + ' + total2;
      return ['1', total, '0'];
    },
    'Total Memory': function (node, metric, args, childrenType, childrenMetric) {
      const metricPlusOne = metric[0] + ' + 1';
      return ['1', cipherSize([metricPlusOne]), '0'];
    },
    'Memory Access': function (node, metric, args, childrenType, childrenMetric) {
      const metricPlusOne = metric[0] + ' + 1';
      return ['1', cipherAccess(metric, '2') + ' + ' + cipherAccess([metricPlusOne], '1'), '0'];
    }
  },
  if_else: {
    'RISK-V Instructions': function (node, metric, args, childrenType, childrenMetric) {
      const c = childrenMetric.condition;

      const param = function (m, c1, c2) {
        return [node, m, args, childrenType, {operands: [c1, c2]}];
      };

      const op1 = module.exports.sadd['RISK-V Instructions'].apply(this, param(metric));
      const op2 = module.exports.smult['RISK-V Instructions'].apply(this, param(op1, c, op1));
      const op3 = module.exports.sadd['RISK-V Instructions'].apply(this, param(op2));
      const sum = op1[1] + ' + ' + op2[1] + ' + ' + op3[1];
      return ['1', sum, '0'];
    },
    'Total Memory': function (node, metric, args, childrenType, childrenMetric) {
      const metricPlusOne = metric[0] + ' + 1';
      return ['1', cipherSize([metricPlusOne]) + ' + 2*' + _(cipherSize(metric)), '0'];
    },
    'Memory Access': function (node, metric, args, childrenType, childrenMetric) {
      const metricPlusOne = metric[0] + ' + 1';
      return ['1', cipherAccess([metricPlusOne], '2') + ' + ' + cipherAccess(metric, '5'), '0'];
    }
  }
};