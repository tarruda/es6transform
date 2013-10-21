var _ = require('lodash');

var transform = require('../src').transform;


var NAME = 'arrows';
var DESC = 'Use harmony arrow functions for more natural functional ' +
           'programming';


module.exports = function(grunt) {
  grunt.registerMultiTask(NAME, DESC, function() {
    _.each(this.files, function(f) {
      _.each(f.src, function(file) {
        var input = grunt.file.read(file);
        var output = transform(input);
        grunt.file.write(f.dest, output);
      });
    });
  });
};
