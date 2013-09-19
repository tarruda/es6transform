var fs = require('fs');
var path = require('path');
var transform = require('../src').transform;

global.expect = require('chai').expect;


var fixtures = [
  'arrowfunctions.js'
];


for (var l=0; l < fixtures.length; l++) {
  var filename = fixtures[l];
  var p = path.join(__dirname, 'fixtures', filename);
  var code = transform(fs.readFileSync(p, 'utf8'));
  var f = new Function(code);
  f();
}
