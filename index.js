const cluster = require('node:cluster');

if (cluster.isPrimary) {
  cluster.setupPrimary({
    exec: 'dist/websocket/server.js',
  });
  cluster.fork();
  cluster.setupPrimary({
    exec: 'dist/main.js',
  });
  cluster.fork();
}
