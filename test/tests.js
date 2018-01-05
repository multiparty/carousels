'use strict';

var expect = require('chai').expect;
var carousels = require('../src/carousels');


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
    'xor_bit': function(type) {
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

describe("#success", function() {
    var code = 'function f(a,b) {return a.mult(b).mult(b);}';
    var result = carousels(code, costObject);
    console.log(result);

    // var code = 'function f(a) {return a.lt(b).gt(b);}';
    // var result = carousels(code);
    // console.log(result);

    // var code = 'function f(a) {return a.lt(b).mult(b);}';
    // var result = carousels(code);
    // console.log(result);

});
