const carouselsTypes = require('../symbols/types.js');

const TypeNode = function (node, pathStr) {
  // special case: IR does not contain any type information => type is missing
  if ((node.type == null || node.type === '') && node.dependentType == null && node.secret !== true) {
    return;
  }

  const typeResult = carouselsTypes.fromTypeNode(node, pathStr);

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
  let variableAssignmentResult = this.visit(node.assignment, pathStr + variableName + '=', true);

  // initialize types and metric for each child
  let typeType, assignmentType, typeMetric, assignmentMetric;

  // make sure there are no conflicts in types between children
  if (variableAssignmentResult != null) {
    assignmentType = variableAssignmentResult.type;
    assignmentMetric = variableAssignmentResult.metric;
    if (variableTypeResult != null) {
      typeType = variableTypeResult.type;
      typeMetric = variableTypeResult.metric;
      if (assignmentType.is(carouselsTypes.ENUM.ANY) && assignmentType.secret === typeType.secret) {
        assignmentType = typeType;
      } else if (assignmentType.conflicts(typeType)) {
        throw new Error('Types for variable "' + pathStr + variableName + '" from assignment and definition have a conflict:\n' +
          'Assignment Type: ' + assignmentType.toString() + '\n' +
          'Definition Type: ' + typeType.toString());
      }
    }
  } else if (variableTypeResult != null) {
    typeType = variableTypeResult.type;
    typeMetric = variableTypeResult.metric;
  } else {
    throw new Error('Cannot determine type of variable "' + pathStr + variableName + '"');
  }


  // Aggregate metric
  const childrenType = {
    type: typeType,
    assignment: assignmentType
  };
  const childrenMetric = {
    type: typeMetric,
    assignment: assignmentMetric
  };

  const aggregateType = assignmentType || typeType;
  const aggregateMetric = analyzer.metric.aggregateVariableDefinition(node, childrenType, childrenMetric);

  // add variable and type to scope
  analyzer.variableTypeMap.add(variableName, aggregateType);
  analyzer.variableMetricMap.add(variableName, analyzer.metric.store(aggregateMetric));

  // make sure aggregateType is valid
  if (aggregateType.is(carouselsTypes.ENUM.UNIT)) {
    throw new Error('Variable "' + variableName + '" at path "' + pathStr + '" is assigned type "UNIT"!');
  }

  return {
    type: aggregateType,
    metric: aggregateMetric
  };
};

const VariableAssignment = function (node, pathStr, inDefinition) {
  const variableName = node.name.name;
  const analyzer = this.analyzer;

  const childResult = this.visit(node.expression, pathStr + '=');
  const variableType = childResult.type;
  const childMetric = childResult.metric;

  // ensure variable assignments does not change the type of the variable if already defined
  // do not allow assigning to global undefined variables
  if (inDefinition !== true) {
    const oldType = analyzer.variableTypeMap.get(variableName);
    if (!oldType.match(variableType)) {
      throw new Error('Type of variable "' + variableName + '" is changed at "' + pathStr + '" after definition!');
    }
  }

  // when modifying the type/metric in scope, take conditions in the current visitor path (starting after where
  // the function was defined) into consideration
  if (inDefinition !== true) {
    analyzer.setTypeWithConditions(variableName, variableType);
    analyzer.setMetricWithConditions(variableName, analyzer.metric.store(childMetric));
  }

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