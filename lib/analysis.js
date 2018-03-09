const imparse = require('imparse');
const polynomium = require('polynomium');

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
    
    if (path.node.type === 'VariableDeclarator') {
      functionName = path.node.id.name;

      if (path.node.uuid === undefined) {
        path.node.uuid = uuidv4(); 
      }
      uuid = path.node.uuid;
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

  function getCosts(path) {
    if (t.isProgram(path)) {
      return path.node.costObject;
    }
    return getCosts(path);
  }

  return {
    visitor: {
      Program(path) {
        path.node.costObject = {};
      },
      FunctionDeclaration(path) {
        var costs = getCosts(path.parentPath);
        var uuid = uuidv4();
        var name = path.node.id.name;
        path.node.uuid = uuid;
        updateGlobalCost(path, polynomium.c(0), uuid, name);
        // updateGlobalCost(path, cost, uuidv4()
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