
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/index.js']
    },
    mocha_debug: {
      options: {
        reporter: 'dot',
        check: ['src/**/*.js', 'test/index.js']
      },
      nodejs: {
        options: {
          src: ['src/**/*.js', 'test/index.js']
        }
      }
    },
    watch: {
      options: {
        nospawn: true
      },
      all: {
        files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        tasks: ['test']
      }
    }
  });
  grunt.event.on('watch', function(action, filepath) {
    grunt.config('jshint.all', [filepath]);
    return grunt.regarde = {
      changed: ['test.js']
    };
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-debug');
  grunt.loadNpmTasks('grunt-release');
  grunt.registerTask('test', ['jshint', 'mocha_debug']);
  grunt.registerTask('publish', ['mocha_debug', 'release']);
  return grunt.registerTask('default', ['test', 'watch']);
};
