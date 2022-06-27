#!/usr/bin/env node

/**
 * Module dependencies.
 */
import Hapi from '@hapi/hapi';
var app = require('../app');
var debug = require('debug')('dealcraftserver:server');
var http = require('http');


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3303');

/**
 * Create HTTP server.
 */
export const server = Hapi.server({
  port: port,
  host: '0.0.0.0'
});
const init = async () => {



  await server.start();
  console.log('Server running on port {}',port);
};
init().then(r => {console.info("loaded")})

/**
 * Listen on provided port, on all network interfaces.
 */
//
// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }
//
//   var bind = typeof port === 'string'
//     ? 'Pipe ' + port
//     : 'Port ' + port;
//
//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }

/**
 * Event listener for HTTP server "listening" event.
 */

// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//   debug('Listening on ' + bind);
// }

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

console.info("starting TS")