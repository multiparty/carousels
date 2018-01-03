const imparse = require('imparse');
const polynomium = require('polynomium');

var costObject = {
  'add': function(type) {
    return '0';
  },
  'mult': function(type) {
    if (type === 'NumericLiteral') {
      return 0;
    }
    return '2*n+3';
  }, 
  'gt': function(type) {
    return '2*l*n+4*l+2*n+2';
  },
  'lt': function(type) {
    return '2*l*n+4*l+2*n+2';
  }
}
  
  
module.exports = function (babel) {
  const t = babel.types;


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

  function updateGlobalCost(path, cost, functionName) {
    if (path.parentPath === null) {
      var costObject = path.node.costObject;
      if (functionName in costObject) {
        var prevCost = costObject[functionName];
        var newCost = prevCost.add(cost);
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
        cost = calculateCost(path, costObject, type);
  
        if (cost !== null) {
          updateGlobalCost(path, cost, null);          
        }
        // TODO: this should probably be an error
      }
    }
  }
};