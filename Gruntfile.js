module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    appName: 'Accordion Slider',
    jsFileName: 'jquery.accordionSlider',
    cssFileName: 'accordion-slider',
    concat: {
      options: {
        separator: '\n\n'
      },
      dist: {
        src: [
          'src/js/jquery.accordionSlider.core.js',
          'src/**/*.js'
        ],
        dest: 'dist/js/<%= jsFileName %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*!\n<%= appName %> by <%= pkg.author %>\n<%= pkg.homepage %>\n*/\n'
      },
      dist: {
        files: {
          'dist/js/<%= jsFileName %>.min.js': '<%= concat.dist.dest %>'
        }
      }
    },
    cssmin: {
      minify: {
        src: 'src/css/<%= cssFileName %>.css',
        dest: 'dist/css/<%= cssFileName %>.min.css'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'concat']
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'concat']);

};