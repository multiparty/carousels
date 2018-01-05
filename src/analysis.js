const imparse = require('imparse');
const polynomium = require('polynomium');
const uuidv4 = require('uuid/v4');

module.exports = function (babel) {
  const t = babel.types;

  function getCostDefinition(path) {

    if (t.isProgram(path.node)) {
      return path.node.costDefinition;
    }
    return getCostDefinition(path.parentPath);
  }

  /**
   * 
   * @param {} path 
   * @param {} operationCosts 
   * @param {*} type 
   */
  function calculateCost(path, operationCosts, type) {
    var operationName;
    var cost = null;

    try {
      operationName = path.node.callee.property.name;
    } catch(TypeError) {
      operationName = path.node.callee.name;
    }

    if (operationName in operationCosts) {
      costFn = operationCosts[operationName];
      cost = convertPoly(costFn(type));
    }
    return cost;
  }

  function parsePoly(parsed) {
    for (var k in parsed) {
      if (k === 'Add') {
        return parsePoly(parsed[k][0]).add(parsePoly(parsed[k][1]));
      } if (k === 'Mul') {
        return parsePoly(parsed[k][0]).mul(parsePoly(parsed[k][1]));
      }
      if (k === 'Var') {
        return polynomium.v(parsed[k][0]);
      }
      if (k === 'Num') {
        return polynomium.c(parseInt(parsed[k][0]));
      }
    }
  }


  function convertPoly(polyString) {

    const GRAMMAR_DEF = [{"Term": [{"Add": [["Factor"], "+", ["Term"]]},{"": [["Factor"]]}]},{"Factor": [{"Mul": [["Atom"], "*", ["Factor"]]},{"": [["Atom"]]}]},{"Atom": [{"Num": [{"RegExp":"[0-9]+"}]},{"Var": [{"RegExp":"([a-zA-Z])([a-zA-Z0-9]*)"}]}]}]

    parsed = imparse.parse(GRAMMAR_DEF, polyString);

    return parsePoly(parsed);
  }

  /**
   * 
   * @param {path object} path 
   * @param {number} cost 
   * @param {string} uuid 
   * @param {string} functionName 
   */
  function updateGlobalCost(path, cost, uuid, functionName) {
    if (t.isProgram(path.node)) {
      var costObject = path.node.costObject;

      if (uuid in costObject) {
        
        var prevCost = costObject[uuid].cost;
        var newCost = prevCost.add(cost);
        costObject[uuid].cost = newCost;
      } else {
        costObject[uuid] = {cost: cost, name: functionName};
      }
      return;
    }
    
    if (path.node.type === 'FunctionDeclaration') {
      functionName = path.node.id.name;

      if (path.node.uuid === undefined) {
        path.node.uuid = uuidv4(); 
      }
      uuid = path.node.uuid;
    }
    // Propagate back up to Program level
    updateGlobalCost(path.parentPath, cost, uuid, functionName);
  }

  return {
    visitor: {
      Program(path) {
        path.node.costObject = {};
      },
      CallExpression(path, parent){
        var type = path.node.arguments[0].type;
        var cost = 0;
        var costDef = getCostDefinition(path.parentPath);
        
        cost = calculateCost(path, costDef, type);
  
        if (cost !== null) {
          updateGlobalCost(path, cost, null, null);          
        }
        // TODO: this should probably be an error
      }
    }
  }
};