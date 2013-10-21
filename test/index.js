/* jshint evil: true */
var fs = require('fs');
var path = require('path');
var transform = require('../lib').transform;

global.expect = require('chai').expect;


var fixtures = [
  'arrow_functions.js',
  // 'destructure.js'
];


for (var l=0; l < fixtures.length; l++) {
  var filename = fixtures[l];
  var p = path.join(__dirname, 'fixtures', filename);
  var code = transform(fs.readFileSync(p, 'utf8'));
  var f = new Function(code);
  f();
}


run({
  'Unsupported features': {
    'yield expression': function() {
      expect(
        function() {
          transform('function *y() { yield 1; }');
         }).to.throw(SyntaxError, 'YieldExpression nodes are not supported');
    },
    'array patterns': function() {
      expect(
        function() {
          transform('function y([a, b]) { console.log(a, b); }');
         }).to.throw(SyntaxError, 'ArrayPattern nodes are not supported');
    },
    'object patterns': function() {
      expect(
        function() {
          transform('function y({a: c, b}) { console.log(c, b); }');
         }).to.throw(SyntaxError, 'ObjectPattern nodes are not supported');
    }
  }
});
