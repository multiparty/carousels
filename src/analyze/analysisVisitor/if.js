const carouselsTypes = require('../symbols/types.js');
const math = require('../math.js');

const dependentIfCombiner = function (condition, ifVal, elseVal) {
  if (condition.isNice) { // TODO
    return math.iff(condition, ifVal, elseVal);
  } else {
    return math.max(ifVal, elseVal);
  }
};

const If = function (node, pathStr) {
  const condition = node.condition;
  const ifBody = node.ifBody;
  const elseBody = node.elseBody;

  // visit children
  const conditionResult = this.visit(condition, pathStr + 'if[condition]');
  const ifResult = this.visit(ifBody, pathStr + 'if[body]');
  const elseResult = this.visit(elseBody, pathStr + 'else[body]');

  // the (return) type of this statement is the union type of
  // the if and else bodies
  const ifType = ifResult.type;
  const elseType = elseResult.type;
  const type = ifType.combine(elseType, dependentIfCombiner.bind(this, condition)); // TODO

  // aggregate children's metrics
  const childrenTypes = {
    condition:  ifType,//conditionResult.types,
    ifBody: ifType,
    elseBody: elseType
  };
  const aggregateMetrics = this.analyzer.mapMetrics(function (metricTitle, metric) {
    const childrenMetrics = {
      condition: math.parse("1"),//conditionResult.metrics[metricTitle], // TODO
      ifBody: ifResult.metrics[metricTitle],
      elseBody: elseResult.metrics[metricTitle]
    };
    return metric.aggregateIf(node, childrenTypes, childrenMetrics);
  });

  // find cost in rules and apply it
  const elseTypeStr = elseType ? elseType.toString() : carouselsTypes.UNIT_TYPE.toString();
  const typeString = ifType.toString()/*conditionResult.type.toString()*/ + '?' + ifType.toString() + ':' + elseTypeStr; // TODO
  const finalMetrics = this.analyzer.costs.applyMatch(node, typeString, aggregateMetrics);

  // return results
  return {
    type: type,
    metrics: finalMetrics
  }
};

module.exports = {
  If: If
};