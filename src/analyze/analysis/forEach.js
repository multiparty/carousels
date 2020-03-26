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

  // find start, end, and increment
  // if range is a range type, use start, accurateEnd, and increment from the range dependent type
  // if range is an array type, use 0, array length, and 1
  let start, end, increment;
  if (rangeResult.type.is(carouselsTypes.ENUM.RANGE)) {
    start = rangeResult.type.dependentType.startType.dependentType.value;
    end = rangeResult.type.dependentType.accurateEnd();
    increment = rangeResult.type.dependentType.incrementType.dependentType.value;
  } else if (rangeResult.type.is(carouselsTypes.ENUM.ARRAY)) {
    start = math.ZERO;
    end = rangeResult.type.dependentType.length;
    increment = math.ONE;
  } else {
    throw new Error('Found non-iterable type "' + rangeResult.type + '" as the range of foreach loop "' + pathStr + '"');
  }

  // create a fresh symbolic parameter representing the iteration counter
  const iterationParameter = Parameter.forLoop(pathStr);
  const iterationMath = iterationParameter.mathSymbol;
  const previousIterationMath = math.sub(iterationMath, increment);
  this.analyzer.addParameters([iterationParameter]);

  // find variables that are modified in body
  const modifiedVisitor = new ModifiedVisitor();
  const modifiedVariables = modifiedVisitor.start(node.body); // these only include variables defined outside the for loop body

  // create abstractions for modified variables and for the loop metric, use value/iteration
  // parameter as the parameter to all these loop abstractions
  const previousVariablesTypes = modifiedVariables.map(function (variableName) {
    return this.analyzer.variableTypeMap.get(variableName);
  }, this);
  const loopAbstractions = abstractions.LoopAbstraction.makeAbstractions(pathStr, this.analyzer.metricTitle,
    this.analyzer.parametersPathTracker.retrieveAll(), iterationParameter, modifiedVariables, previousVariablesTypes);

  // save metrics and types prior to body so they can later be used as initial values (base case) for abstractions
  // put concretized abstractions at iteration = (value/iteration parameter - increment) as the metric and type for all the variables
  // inside the type and metric scopes
  // this only applies for variables that existed before the for loop, and will survive the execution of a loop iteration
  // variables defined within the for loop will be handled automatically by visiting their body (they do not need an initial metric/type
  // since they will be assigned values before use inside body, otherwise the program is invalid)
  const initialType = {};
  const initialMetric = {};
  for (let i = 0; i < modifiedVariables.length; i++) {
    const variableName = modifiedVariables[i];
    initialMetric[variableName] = this.analyzer.variableMetricMap.get(variableName);
    this.analyzer.variableMetricMap.set(variableName, loopAbstractions.variables.metrics[variableName].concretize([previousIterationMath]));

    // type loop abstraction is only used for array lengths
    if (previousVariablesTypes[i].is(carouselsTypes.ENUM.ARRAY)) {
      initialType[variableName] = previousVariablesTypes[i];
      const abstractedType = previousVariablesTypes[i].copy();
      abstractedType.dependentType.length = loopAbstractions.variables.types[variableName].concretize([previousIterationMath]);
      this.analyzer.variableTypeMap.set(variableName, abstractedType);
    }
  }
  const previousIterationMetric = loopAbstractions.loop.concretize([previousIterationMath]);

  // iterator is added to scope (as if it is a variable definition)
  this.analyzer.addScope();
  const iteratorName = node.iterator.name;
  childrenType.iterator = rangeResult.type.is(carouselsTypes.ENUM.RANGE) ? new carouselsTypes.NumberType(false, previousIterationMath) : rangeResult.type.dependentType.elementsType.copy();
  childrenMetric.iterator = rangeResult.metric;
  this.analyzer.variableTypeMap.add(iteratorName, childrenType.iterator);
  this.analyzer.variableMetricMap.add(iteratorName, this.analyzer.metric.store(childrenMetric.iterator));
  this.analyzer.parametersPathTracker.add({parameter: iterationParameter, value: previousIterationMath});

  // pretty printing and debugging
  this.analyzer.intermediateResults.push({
    node: node.iterator,
    result: {
      type: childrenType.iterator,
      metric: childrenMetric.iterator
    }
  });
  this.analyzer.functionLoopAbstractionMap[this.analyzer.currentFunctionName].addChild();

  // visit body
  const bodyResult = this.visit(node.body, pathStr + '[body]');
  childrenType.body = bodyResult.type;
  childrenMetric.body = bodyResult.metric;

  // remove scope
  this.analyzer.removeScope();

  // compute closed form of every abstraction as:
  // <Abs>(<i>) = iff(<i> == start, <initial>, <bodyScope>[<Abs>] (which is a function of <Abs>(<i> - <increment>)) ...)
  // store closed form in analyzer
  // concretize abstractions at iteration parameter = end as the metric and type for all the variables
  // put those inside the type and metric scopes
  const abstractionsArray = [];
  for (let i = 0; i < modifiedVariables.length; i++) {
    const variableName = modifiedVariables[i];

    // compute closed form for metric
    const closedForm = math.iff(math.lte(iterationMath, start), initialMetric[variableName], this.analyzer.variableMetricMap.get(variableName));
    abstractionsArray.push(loopAbstractions.variables.metrics[variableName]);
    this.analyzer.abstractionToClosedFormMap[loopAbstractions.variables.metrics[variableName].mathSymbol.toString()] = closedForm;
    this.analyzer.setMetricWithConditions(variableName, loopAbstractions.variables.metrics[variableName].concretize([end]), initialMetric[variableName]);

    // compute closed form for type (if needed and type is an array)
    if (initialType[variableName] != null) {
      const newType = this.analyzer.variableTypeMap.get(variableName);
      const newLength = newType.dependentType.length;
      const lengthClosedForm = math.iff(math.lte(iterationMath, start), initialType[variableName].dependentType.length, newLength);
      abstractionsArray.push(loopAbstractions.variables.types[variableName]);
      this.analyzer.abstractionToClosedFormMap[loopAbstractions.variables.types[variableName].mathSymbol.toString()] = lengthClosedForm;

      const finalType = newType.copy();
      finalType.dependentType.length = loopAbstractions.variables.types[variableName].concretize([end]);
      this.analyzer.setTypeWithConditions(variableName, finalType, initialType[variableName]);
    }
  }

  // call aggregate For Each on conretize loop metric abstraction with iteration parameter = end
  childrenMetric.previousIterationMetric = previousIterationMetric;
  const aggregateMetric = this.analyzer.metric.aggregateForEach(node, childrenType, childrenMetric);

  // concretize the loop metric abstraction and its closed form and return
  const loopClosedForm = math.iff(math.lte(iterationMath, start), this.analyzer.metric.initial, aggregateMetric);
  abstractionsArray.unshift(loopAbstractions.loop);
  this.analyzer.abstractionToClosedFormMap[loopAbstractions.loop.mathSymbol.toString()] = loopClosedForm;
  const finalMetric = loopAbstractions.loop.concretize([end]);

  // for pretty printing
  this.analyzer.functionLoopAbstractionMap[this.analyzer.currentFunctionName].toParent();
  this.analyzer.functionLoopAbstractionMap[this.analyzer.currentFunctionName].setElement({loopName: pathStr, abstractions: abstractionsArray});

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