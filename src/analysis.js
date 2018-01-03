
var shareCosts = {
    'add': '0',
    'subt': '0',
    'mult': '2n+3', 
    'gt': '2ln+4l+2n+2',
    'lt': '2ln+4l+2n+2',
    'lte': '2ln+4l+2n+2',
    'gte': '2ln+4l+2n+2',
    'eq': '4ln+8l+6n+7',
    'neq': '4ln+8l+6n+7',
    'not': '0', 
    'xor_bit': '2n+3'
  };
  
  
  var constantCosts = {
    'add': '0',
    'subt': '0',
    'mult': '0',
    'gt': '2ln+4l+2n+2',
    'lt': '2ln+4l+2n+2',
    'lte': '2ln+4l+2n+2',
    'gte': '2ln+4l+2n+2',
    'not': '0', 
    'eq': '4ln+8l+6n+7',
    'neq': '4ln+8l+6n+7',
    'xor_bit': '0'
  };
  
  
  module.exports = function (babel) {
    const t = babel.types;
  
  
    function calculateCost(path, operationCosts) {
      var operationName;
      var cost = null;
      try {
        operationName = path.node.callee.property.name;
      } catch(TypeError) {
        operationName = path.node.callee.name;
      }
  
      if (operationName in operationCosts) {
        cost = operationCosts[operationName];
      }
  
      return cost;
    }
  
  
    function updateGlobalCost(path, cost, functionName) {
      if (path.parentPath === null) {
        var costObject = path.node.costObject;
        if (functionName in costObject) {
          var prevCost = costObject[functionName];
          var newCost = prevCost + '+' + cost;
          costObject[functionName] = newCost;
        } else {
          costObject[functionName] = cost;
        }
        return;
      }
      
      if (path.node.type === 'FunctionDeclaration') {
        functionName = path.node.id.name;
      }
      // Propagate back up to Program level
      updateGlobalCost(path.parentPath, cost, functionName);
    }
  
    return {
      visitor: {
        Program(path) {
          path.node.costObject = {};
        },
        CallExpression(path, parent){
          var type = path.node.arguments[0].type;
          var cost = 0;
          if (type === 'NumericLiteral') {
            cost = calculateCost(path, constantCosts);
          } else {
            cost = calculateCost(path, shareCosts);
          }
          if (cost !== null) {
            updateGlobalCost(path, cost, null);          
          }
          // TODO: this should probably be an error
        }
      }
    }
  };