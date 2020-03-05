const carouselsTypes = require('../symbols/types.js');

const TypeNode = function (node, pathStr) {
  const typeResult = carouselsTypes.Type.fromTypeNode(pathStr, node);

  // Add any newly created symbolic parameters
  this.analyzer.addParameters(typeResult.parameters);

  return {
    type: typeResult.type,
    metric: this.analyzer.metric.aggregateTypeNode(node, typeResult.type, {})
  };
};

const VariableDefinition = function (node, pathStr) {
  const variableName = node.name.name;
  const analyzer = this.analyzer;

  // visit static type definition and assignment (if they exist)
  let variableTypeResult = this.visit(node.type, pathStr + variableName + '[type]');
  let variableAssignmentResult = this.visit(node.assignment, pathStr + variableName + '=');

  // initialize types and metric for each child
  let typeType, assignmentType, typeMetric;
  let assignmentMetric = analyzer.metric.initial;

  // make sure there are no conflicts in types between children
  if (variableAssignmentResult != null) {
    assignmentType = variableAssignmentResult.type;
    assignmentMetric = variableAssignmentResult.metric;
    if (variableTypeResult != null) {
      typeType = variableTypeResult.type;
      typeMetric = variableTypeResult.metric;
      if (assignmentType.conflicts(typeType)) {
        throw new Error('Types for variable "' + pathStr + variableName + '" from assignment and definition have a conflict:\n' +
          'Assignment Type: ' + assignmentType.toString() + '\n' +
          'Definition Type: ' + typeType.toString());
      }
    }
  } else if (variableTypeResult != null) {
    assignmentType = variableTypeResult.type;
    typeMetric = variableTypeResult.metric;
  } else {
    throw new Error('Cannot determine type of variable "' + pathStr + variableName + '"');
  }

  // add variable and type to scope
  analyzer.variableTypeMap.add(variableName, assignmentType || typeType);

  // Aggregate metric
  const childrenType = {
    type: typeType,
    assignment: assignmentType
  };
  const childrenMetric = {
    type: typeMetric,
    assignment: assignmentMetric
  };

  const aggregateMetric = analyzer.metric.aggregateVariableDefinition(node, childrenType, childrenMetric);
  return {
    type: assignmentType || typeType,
    metric: aggregateMetric
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
  const childMetric = childResult.metric;

  analyzer.variableTypeMap.add(variableName, variableType);
  analyzer.variableMetricMap.add(variableName, analyzer.metric.store(childMetric));

  return {
    type: variableType,
    metric: analyzer.metric.aggregateVariableAssignment(node, {expression: variableType}, {expression: childMetric})
  }
};

module.exports = {
  TypeNode: TypeNode,
  VariableDefinition: VariableDefinition,
  VariableAssignment: VariableAssignment
};