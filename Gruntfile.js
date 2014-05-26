module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-nodemon");

  grunt.initConfig({
    connect: {
      server: {
        options: {
          keepalive: true,
          port: 8000,
          hostname: '*',
          onCreateServer: function(server, connect, options) {
            var io = require('socket.io').listen(server);
            io.sockets.on('connection', function(socket) {
              // do something with socket
            });
          }
        }
      }
    },
    nodemon: {
      server: {
        script: 'server.js'
      }
    },
    concurrent: {
      server: {
        tasks: ['nodemon', 'connect'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.registerTask('default', ['concurrent:server'])
}
