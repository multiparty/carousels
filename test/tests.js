'use strict';

var expect = require('chai').expect;
var index = require('../src/index');



describe("#success", function() {
    var code = 'function f(a) {return a.mult(10);}';

    var result = index(code);
    console.log('costs',result);
});
