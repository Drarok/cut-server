const server = require('./src/server');

const port = parseInt(process.env.PORT || '5443');

server.listen(port, () => {
  console.log(`Share server running at http://0.0.0.0:${port}/`);
});
