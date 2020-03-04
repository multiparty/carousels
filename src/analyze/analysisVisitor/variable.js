const carouselsTypes = require('../symbols/types.js');

const TypeNode = function (node, pathStr) {
  const typeResult = carouselsTypes.Type.fromTypeNode(pathStr, node);

  this.analyzer.addParameters(typeResult.parameters);
  const metrics = this.analyzer.mapMetrics(function (metricTitle, metric) {
    return metric.aggregateTypeNode(node, typeResult.type, {});
  });

  return {
    type: typeResult.type,
    metrics: metrics
  };
};

const VariableDefinition = function (node, pathStr) {
  const variableName = node.name.name;
  const analyzer = this.analyzer;

  // visit static type definition and assignment (if they exist)
  let variableTypeResult = this.visit(node.type, pathStr + variableName + '[type]');
  let variableAssignmentResult = this.visit(node.assignment, pathStr + variableName + '=');

  // initialize types and metric for each child
  let typeType, assignmentType, typeMetrics;
  let assignmentMetrics = analyzer.mapMetrics(function (metricTitle, metric) {
    return metric.initial;
  });

  // make sure there are no conflicts in types between children
  if (variableAssignmentResult != null) {
    assignmentType = variableAssignmentResult.type;
    assignmentMetrics = variableAssignmentResult.metrics;
    if (variableTypeResult != null) {
      typeType = variableTypeResult.type;
      typeMetrics = variableTypeResult.metrics;
      if (assignmentType.conflicts(typeType.type)) {
        throw new Error('Types for variable "' + pathStr + variableName + '" from assignment and definition have a conflict:\n' +
          'Assignment Type: ' + assignmentType.toString() + '\n' +
          'Definition Type: ' + typeType.toString());
      }
    }
  } else if (variableTypeResult != null) {
    assignmentType = variableTypeResult.type;
    typeMetrics = variableTypeResult.metrics;
  } else {
    throw new Error('Cannot determine type of variable "' + pathStr + variableName + '"');
  }

  // add variable and type to scope
  analyzer.variableTypeMap.add(variableName, assignmentType || typeType);

  // Aggregate metrics
  const resultMetrics = analyzer.mapMetrics(function (metricTitle, metric) {
    return metric.aggregateVariableDefinition(node, {type: typeType, assignment: assignmentType},
      {type: typeMetrics[metricTitle], assignment: assignmentMetrics[metricTitle]});
  });

  return {
    type: assignmentType || typeType,
    metrics: resultMetrics
  };
};

const VariableAssignment = function (node, pathStr) {
  const variableName = node.name.name;
  const analyzer = this.analyzer;

  const childResult = this.visit(node.expression, pathStr + '=');
  if (childResult == null) { // TODO
    return null; // null
  }
  const variableType = childResult.type;

  analyzer.variableTypeMap.add(variableName, variableType);
  const metrics = analyzer.mapMetrics(function (metricTitle, metric) {
    analyzer.variableMetricMap.add(variableName, metric.store(childResult[metricTitle]));
    return metric.aggregateVariableAssignment(node, {expression: variableType}, {expression: childResult[metricTitle]});
  });

  return {
    type: variableType,
    metrics: metrics
  }
};

module.exports = {
  TypeNode: TypeNode,
  VariableDefinition: VariableDefinition,
  VariableAssignment: VariableAssignment
};