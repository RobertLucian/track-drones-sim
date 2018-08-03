#!/usr/bin/env node
// docker container run -it --rm -w /app -v $(pwd):/app -p 8081:8081 --network drone-net
// --name sockjs node:8-alpine node relayer.js some-rabbit

const http = require('http');
const sockjs = require('sockjs');
const amqp = require('amqplib/callback_api');
const path = require('path');

const args = process.argv.slice(2);
const bufferTime = 10000;
const rate = 2.0;
const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

if (args.length !== 1) {
  console.log('Usage: %s amqp-address', path.basename(process.argv[1]));
  process.exit(9);
}
const amqpAddr = args[0];
let messages = [];

console.log(` [x] Rate at which data is relayed: ${rate} msg/sec`);
console.log(` [x] How old can the messages be  : ${bufferTime} ms`);

function goForErrorIfNeeded(err, exitCode) {
  if (err !== null) {
    console.error(Error(err));
    process.exit(exitCode);
  }
}

amqp.connect(`amqp://${amqpAddr}`, (err, connBroker) => {
  goForErrorIfNeeded(err, 1);
  connBroker.createChannel((errCH, ch) => {
    goForErrorIfNeeded(errCH, 1);
    ch.on('close', () => {
      console.log(` [!] Closing broker connection to amqp://${amqpAddr}`);
      process.exit(0);
    });
    ch.on('error', (errON) => {
      console.error(Error(errON));
      console.error(` [!] Got error for channel from broker amqp://${amqpAddr}`);
      process.exit(1);
    });

    const ex = 'drones';
    ch.assertExchange(ex, 'fanout', { durable: false });
    ch.assertQueue('', { exclusive: true }, (errQ, q) => {
      goForErrorIfNeeded(errQ, 1);

      ch.bindQueue(q.queue, ex, '');
      ch.consume(q.queue, (msg) => {
        const message = JSON.parse(msg.content.toString());
        const index = messages.findIndex(element => element.id === message.id);
        if (index === -1) {
          messages.push(message);
        } else {
          messages[index] = message;
        }
      }, { noAck: true });
    });
  });
});

const sockServer = sockjs.createServer({
  sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
});

sockServer.on('connection', (connSock) => {
  console.log(` [!] Connected to browser client with ID=${connSock.id}`);

  connSock.on('close', () => {
    console.log(` [!] Closing browser client connection with ID=${connSock.id}`);
    connSock.close();
  });

  (async () => {
    while (true) {
      await wait(Math.trunc(1000.0 / rate));
      const currentTime = Date.now();
      messages = messages.filter(element => element.time + bufferTime >= currentTime);
      connSock.write(JSON.stringify(messages));
    }
  })();
});

const server = http.createServer();
sockServer.installHandlers(server, { prefix: '/websockets' });
server.listen(8081, '0.0.0.0');

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
