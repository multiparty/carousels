'use strict';

var expect = require('chai').expect;
var carousels = require('../src/carousels');


var costDef = {
    'add': function(type) {
      return '0';
    },
    'mult': function(type) {
      if (type === 'NumericLiteral') {
        return '0';
      }
      return '2*n+3';
    }, 
    'xor_bit': function(type) {
      if (type === 'NumericLiteral') {
        return '0';
      }  
      return '2*n+3';
    },
    'gt': function(type) {
      return '2*l*n+4*l+2*n+2';
    },
    'lt': function(type) {
      return '2*l*n+4*l+2*n+2';
    },
    'gte': function(type) {
      return '2*l*n+4*l+2*n+2';
    },
    'lte': function(type) {
      return '2*l*n+4*l+2*n+2';
    }, 
    'eq': function(type) {
      return '4*l*n+8*l+6*n+7';
    }, 
    'neq': function(type) {
      return '4*l*n+8*l+6*n+7';
    }, 
    'not': function(type) {
      return '0';
    }
  }


function getOneResult(code) {
  var result = carousels(code, costDef);
  return result[Object.keys(result)[0]];
}

describe("#success", function() {

  it('mult', function() {
    var code = 'function f(a,b) {return a.mult(b).mult(b);}';
    var result = carousels(code, costDef);

    var cost = result[Object.keys(result)[0]].cost;
    expect(cost).to.equal('4n + 6');
  });

  it('mult-literal', function() {
    var code = 'function f(a) {return a.mult(1);}';
    var result = carousels(code, costDef);
    var cost = result[Object.keys(result)[0]].cost;
    expect(cost).to.equal('');
  });

  it('add', function() {
    var code = 'function f(a,b) {return a.add(b).add(b);}';
    var result = carousels(code, costDef);

    var cost = result[Object.keys(result)[0]].cost;
    // should equal 0
    expect(cost).to.equal('');
  
  });


  it('xor', function() {
    var code = 'function f(a,b) {return a.xor_bit(b);}';
    var result = getOneResult(code);
    expect(result.cost).to.equal('2n + 3');
  });
    
  it('xor', function() {
    var code = 'function f(a) {return a.xor_bit(10);}';
    var result = getOneResult(code);
    expect(result.cost).to.equal('');
  });

  it('eq', function() {
    var code = 'function f(a,b) {return a.eq(b);}';
    var result = getOneResult(code);
    expect(result.cost).to.equal('4l*n + 8l + 6n + 7');
  });

  it('neq', function() {
    var code = 'function f(a,b) {return a.neq(b);}';
    var result = getOneResult(code)
    expect(result.cost).to.equal('4l*n + 8l + 6n + 7');
  });

  it('Overwriting function names', function() {
    var code = 'function f(a) {return a.mult(a);}function f(a) {return a.add(a);}';
    var result = carousels(code, costDef);
    for (var id in result) {
      expect(result[id].name === 'f');
    }
  });

  it('No call expressions', function() {
    var code = 'function f(a){return a;}';
    var result = carousels(code, costDef);
    var cost = result[Object.keys(result)[0]].cost;
    // should return 0
  });

  it('Call expression in variable definition', function() {
    var code = 'var a = b.mult(a)';
    var result = carousels(code, costDef);
    var cost = result[Object.keys(result)[0]].cost;
    var name = result[Object.keys(result)[0]].name;
    expect(cost).to.equal('2n + 3');
    expect(name).to.equal('a');
  });


  

});
