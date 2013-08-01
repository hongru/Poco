/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
                         // Metadata.
                         pkg:grunt.file.readJSON('package.json'),
                         banner:'/*<%= grunt.template.today("yyyy-mm-dd") %>-<%= pkg.author%>*/',
                         // Task configuration.
                         concat:{
                             options:{
                                 banner:'<%= banner %>',
                                 stripBanners:true
                             },
                             poco:{
                                 src:['build/<%= pkg.version%>/poco.init-min.js', 'build/<%= pkg.version%>/poco.class-min.js','build/<%= pkg.version%>/poco.polygon-min.js','build/<%= pkg.version%>/poco.contact-min.js','build/<%= pkg.version%>/poco.world-min.js'],
                                 dest:'build/<%= pkg.version%>/poco.js'
                             }
                         },
                         uglify:{
                             options:{
                                 banner:'<%= banner %>'
                             },
                             poco:{
                                 files:{
                                     'build/<%= pkg.version%>/poco.init-min.js':['src/poco.init.js'],
                                     'build/<%= pkg.version%>/poco.class-min.js':['src/poco.class.js'],
                                     'build/<%= pkg.version%>/poco.polygon-min.js':['src/poco.polygon.js'],
                                     'build/<%= pkg.version%>/poco.contact-min.js':['src/poco.contact.js'],
                                     'build/<%= pkg.version%>/poco.world-min.js':['src/poco.world.js']
                                 }
                             }
                         }
                     });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', ['uglify:poco', 'concat:poco']);

};
