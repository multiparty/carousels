const math = require('../math.js');

const carouselsTypes = require('../symbols/types.js');
const Parameter = require('../symbols/parameter.js');
const abstractions = require('../symbols/abstractions.js');

const ModifiedVisitor = require('../helpers/modified.js');

const ForEach = function (node, pathStr) {
  // we only support iterators that are direct names
  if (node.iterator.nodeType !== 'NameExpression') {
    throw new Error('Unsupported iterator node of type "' + node.iterator.nodeType +'", expected "NameExpression"!');
  }

  // Visit children!
  const childrenType = {};
  const childrenMetric = {};

  // range
  const rangeResult = this.visit(node.range, pathStr + '[range]');
  childrenType.range = rangeResult.type;
  childrenMetric.range = rangeResult.metric;

  // find type, parameters, and symbolic range of iterator
  // if range is a range type, create a value parameter for it, keep start, end=accurateEnd, and increment as those of the range
  // if range is an array type, create an iteration parameter for it, keep start, end, and 1 as 0, length, and 1
  const iteratorName = node.iterator.name;
  let start, end, increment, iteratorParameter, iteratorType;
  if (rangeResult.type.is(carouselsTypes.ENUM.RANGE)) {
    start = rangeResult.type.dependentType.startType.dependentType.value;
    end = rangeResult.type.dependentType.accurateEnd();
    increment = rangeResult.type.dependentType.incrementType.dependentType.value;
    // figure out iterator type
    iteratorParameter = Parameter.forValue(pathStr+'[iterator]');
    iteratorType = new carouselsTypes.NumberType(false, iteratorParameter.mathSymbol);
  } else if (rangeResult.type.is(carouselsTypes.ENUM.ARRAY)) {
    start = math.ZERO;
    end = rangeResult.type.dependentType.length;
    increment = math.ONE;
    // figure out iterator type
    iteratorParameter = Parameter.forLoopRange(pathStr);
    iteratorType = rangeResult.type.dependentType.elementsType.copy();
  } else {
    throw new Error('Found non-iterable type "' + rangeResult.type + '" as the range of foreach loop "' + pathStr + '"');
  }
  this.analyzer.addParameters([iteratorParameter]);
  const iteratorMath = iteratorParameter.mathSymbol;

  // iterator is added to scope (as if it is a variable definition)
  childrenType.iterator = iteratorType;
  childrenMetric.iterator = rangeResult.metric;
  this.analyzer.variableTypeMap.add(iteratorName, childrenType.iterator);
  this.analyzer.variableMetricMap.add(iteratorName, this.analyzer.metric.store(childrenMetric.iterator));
  this.analyzer.intermediateResults.push({ // for debugging
    node: node.iterator,
    result: {
      type: childrenType.iterator,
      metric: childrenMetric.iterator
    }
  });

  // find variables that are modified in body
  const modifiedVisitor = new ModifiedVisitor();
  const modifiedVariables = modifiedVisitor.start(node.body);

  // create abstractions for modified variables and for the loop metric, use value/iteration
  // parameter as the parameter to all these loop abstractions
  const previousVariablesTypes = [];
  const existingModifiedVariables = modifiedVariables.filter(function (variableName) {
    if (variableName === iteratorName) {
      throw new Error('For each iterator variable "' + iteratorName + '" is modified in the body of for each loop "' + pathStr + '"')
    }
    if (this.analyzer.variableTypeMap.has(variableName)) {
      previousVariablesTypes.push(this.analyzer.variableTypeMap.get(variableName));
      return true;
    }
    return false;
  }, this);
  const loopAbstractions = abstractions.LoopAbstraction.makeAbstractions(pathStr, this.analyzer.metricTitle, iteratorParameter, existingModifiedVariables, previousVariablesTypes);

  // save metrics and types prior to body so they can later be used as initial values (base case) for abstractions
  // put concretized abstractions at iteration = (value/iteration parameter - increment) as the metric and type for all the variables
  // inside the type and metric scopes
  // this only applies for variables that existed before the for loop, and will survive the execution of a loop iteration
  // variables defined within the for loop will be handled automatically by visiting their body (they do not need an initial metric/type
  // since they will be assigned values before use inside body, otherwise the program is invalid)
  const initialType = {};
  const initialMetric = {};
  const previousIterationMath = math.sub(iteratorMath, increment);
  for (let i = 0; i < existingModifiedVariables.length; i++) {
    const variableName = existingModifiedVariables[i];
    initialMetric[variableName] = this.analyzer.variableMetricMap.get(variableName);
    this.analyzer.variableMetricMap.add(variableName, loopAbstractions.variables.metrics[variableName].concretize([previousIterationMath]));

    // type loop abstraction is only used for array lengths
    if (previousVariablesTypes[i].is(carouselsTypes.ENUM.ARRAY)) {
      initialType[variableName] = previousVariablesTypes[i].dependentType.length;
      const abstractedType = previousVariablesTypes[i].copy();
      abstractedType.dependentType.length = loopAbstractions.variables.types[variableName].concretize([previousIterationMath]);
      this.analyzer.variableTypeMap.add(variableName, abstractedType);
    }
  }
  const previousIterationMetric = loopAbstractions.loop.concretize([previousIterationMath]);

  // visit body
  const bodyResult = this.visit(node.body, pathStr + '[body]');
  childrenType.body = bodyResult.type;
  childrenMetric.body = bodyResult.metric;

  // compute closed form of every abstraction as:
  // <Abs>(<i>) = iff(<i> == start, <initial>, <bodyScope>[<Abs>] (which is a function of <Abs>(<i> - <increment>)) ...)
  // store closed form in analyzer
  // concretize abstractions at iteration parameter = end as the metric and type for all the variables
  // put those inside the type and metric scopes
  const abstractionsArray = [];
  for (let i = 0; i < existingModifiedVariables.length; i++) {
    const variableName = existingModifiedVariables[i];

    // compute closed form for metric
    const closedForm = math.iff(math.eq(iteratorMath, start), initialMetric[variableName], this.analyzer.variableMetricMap.get(variableName));
    abstractionsArray.push(loopAbstractions.variables.metrics[variableName]);
    this.analyzer.abstractionToClosedFormMap[loopAbstractions.variables.metrics[variableName].mathSymbol.toString()] = closedForm;
    this.analyzer.variableMetricMap.add(variableName, loopAbstractions.variables.metrics[variableName].concretize([end]));

    // compute closed form for type (if needed and type is an array)
    if (initialType[variableName] != null) {
      const newType = this.analyzer.variableTypeMap.get(variableName);
      const newLength = newType.dependentType.length;
      const lengthClosedForm = math.iff(math.eq(iteratorMath, start), initialType[variableName], newLength);
      abstractionsArray.push(loopAbstractions.variables.types[variableName]);
      this.analyzer.abstractionToClosedFormMap[loopAbstractions.variables.types[variableName].mathSymbol.toString()] = lengthClosedForm;

      const finalType = newType.copy();
      finalType.dependentType.length = loopAbstractions.variables.types[variableName].concretize([end]);
      this.analyzer.variableTypeMap.add(variableName, finalType);
    }
  }

  // call aggregate For Each on conretize loop metric abstraction with iteration parameter = end
  childrenMetric.previousIterationMetric = previousIterationMetric;
  const aggregateMetric = this.analyzer.metric.aggregateForEach(node, childrenType, childrenMetric);

  // concretize the loop metric abstraction and its closed form and return
  const loopClosedForm = math.iff(math.eq(iteratorMath, start), this.analyzer.metric.initial, aggregateMetric);
  abstractionsArray.unshift(loopAbstractions.loop);
  this.analyzer.abstractionToClosedFormMap[loopAbstractions.loop.mathSymbol.toString()] = loopClosedForm;
  const finalMetric = loopAbstractions.loop.concretize([end]);

  // for pretty printing
  this.analyzer.loopAbstractions[pathStr] = abstractionsArray;

  // For Each is not supported by cost or typing rules: skip!
  // done
  return {
    type: carouselsTypes.UNIT,
    metric: finalMetric
  };
};

module.exports = {
  ForEach: ForEach
};