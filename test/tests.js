'use strict';

var expect = require('chai').expect;
var carousels = require('../src/carousels');



describe("#success", function() {
    var code = 'function f(a,b) {return a.mult(b).mult(b);}';
    var result = carousels(code);
    console.log(result);

    var code = 'function f(a) {return a.lt(b).gt(b);}';
    var result = carousels(code);
    console.log(result);

    var code = 'function f(a) {return a.lt(b).mult(b);}';
    var result = carousels(code);
    console.log(result);

});
