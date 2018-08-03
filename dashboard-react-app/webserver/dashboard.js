#!/usr/bin/env node

// docker container run -it --rm -w /app -v $(pwd):/app -p 80:8000
// --name app node:8-alpine node dashboard.js

const express = require('express');

const app = express();

app.use('/static', express.static(`${__dirname}/static`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

const server = app.listen(3000, '0.0.0.0', () => {
  const host = server.address().address;
  const portnum = server.address().port;

  console.log('Example app listening at http://%s:%s', host, portnum);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
