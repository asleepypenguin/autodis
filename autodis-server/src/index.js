/* eslint-disable no-console */
// this port MUST match the broadcast port on the client
const bcastPort = 6401;
const os = require('os');
// feathers js
const logger = require('winston');
const spdutils = require('./spdutils');
//const spdutils = require('./src/spd-utils');
const app = require('./app');
//const app = require('./src/app');
const port = app.get('port');
const server = app.listen(port);

const dgram = require('dgram');
const bcastListener = dgram.createSocket('udp4');

bcastListener.on('listening', () => {
  const address = bcastListener.address();
  logger.info(`server listening ${address.address}:${address.port}`);
});
bcastListener.on('message', (msg, rinfo) => {
  var msgObj = spdutils.buf2json(msg);
  logger.info('server got: ' + msgObj.msg);
  if (msgObj.msg == "spd-chat-server-ip-request") {
    logger.info(`sending response`);
    var returnObj = {};
    returnObj.msg = 'spd-chat-server-ip';
    returnObj.serverIp = '192.168.20.16';
    returnObj.serverPort = port;
    returnObj.serverName = os.hostname();
    var data = spdutils.json2buf(returnObj);
    bcastListener.send(data, rinfo.port, rinfo.address);
  }
});
bcastListener.bind(bcastPort);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);

//nw.Window.open('./public/index.html', {}, function(win) {});
