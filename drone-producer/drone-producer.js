#!/usr/bin/env node
// docker container run -d --name slowproducer -v $(pwd):/drones -w /drones
// --network drone-net node:8-alpine node drone-producer.js some-rabbit --slow-moving-drone

// docker container run -d --name producer -v $(pwd):/drones -w /drones
// --network drone-net node:8-alpine node drone-producer.js some-rabbit

const amqp = require('amqplib/callback_api');
const path = require('path');
const { execSync } = require('child_process');
const faker = require('faker');

const args = process.argv.slice(2);
// const time = new Date();
const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

const ContainerID = execSync('cat /proc/self/cgroup | head -1 | cut -d \'/\' -f3').toString().replace(/\n$/, '');
const longitude = parseFloat(faker.address.longitude());
const latitude = parseFloat(faker.address.latitude());
let data = {};

if (args.length === 0 || args.length > 2) {
  console.log('Usage: %s amqp-address [--slow-moving-drone]', path.basename(process.argv[1]));
  process.exit(9);
}

const amqpAddrr = args[0];
let slowMoving = false;
let counter = 0;
if (args[1] === '--slow-moving-drone') {
  slowMoving = true;
}

function goForErrorIfNeeded(err, exitCode) {
  if (err != null) {
    console.error(Error(err));
    process.exit(exitCode);
  }
}

function formattedDate() {
  let result = '';
  const date = new Date();
  result += `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()
  } ${date.getHours()}:${date.getMinutes()}:${
    date.getSeconds()} ${date.getMilliseconds()}`;

  return result;
}

function gaussianRandom(mean, sigma) {
  const u = Math.random() * 0.682;
  return ((u % 1e-8 > 5e-9 ? 1 : -1)
          * (Math.sqrt(-Math.log(Math.max(1e-9, u))) - 0.618))
          * 1.618 * sigma + mean;
}


amqp.connect(`amqp://${amqpAddrr}`, (err, conn) => {
  goForErrorIfNeeded(err, 1);

  conn.createChannel((errC, ch) => {
    goForErrorIfNeeded(errC, 1);
    const ex = 'drones';
    ch.on('close', () => {
      console.log(' [x] Got closing event for channel');
      process.exit(0);
    });
    ch.on('error', (errON) => {
      console.error(Error(errON));
      process.exit(1);
    });
    ch.assertExchange(ex, 'fanout', { durable: false });

    (async () => {
      while (true) {
        await wait(500);
        if (!slowMoving) {
          data = {
            longitude: parseFloat((longitude + gaussianRandom(0.0, 0.2)).toFixed(3)),
            latitude: parseFloat((latitude + gaussianRandom(0.0, 0.2)).toFixed(3)),
            speed: parseFloat(gaussianRandom(3.0, 0.2).toFixed(3)),
            id: ContainerID,
            time: Date.now(),
            lastMovement: Date.now(),
          };
        } else {
          if (counter % 25 === 0) {
            data = {
              longitude: parseFloat((longitude + gaussianRandom(0.0, 0.1)).toFixed(3)),
              latitude: parseFloat((latitude + gaussianRandom(0.0, 0.1)).toFixed(3)),
              speed: parseFloat(gaussianRandom(3.0, 0.2).toFixed(3)),
              id: ContainerID,
              time: Date.now(),
              lastMovement: Date.now(),
            };
          } else {
            data.speed = 0;
            data.time = Date.now();
          }
          counter += 1;
        }
        const reduced = data;
        reduced.id = data.id.substring(0, 16);
        const stringified = JSON.stringify(reduced);
        console.log(' [x] at %s publish this %s', formattedDate(), stringified);
        ch.publish(ex, '', Buffer.from(stringified));
      }
    })();
  });

  process.on('SIGINT', conn.close.bind(conn));
});
