require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const redis = require('redis');
const app = express();

const port = process.env.PORT || 3005;
let server = app.listen(port);
//Redis connection
let client = redis.createClient(`${process.env.RedisPort}`,`${process.env.RedisHost}`);
client.auth(`${process.env.RedisPwd}`);
client.on('connect', function() {console.log('Redis client connected');});
client.on('error', function (err) {console.log('Something went wrong ' + err);});

let options = {
  allowUpgrades: true,
  //transports: ['websocket'],
  pingTimeout: 9000,
  pingInterval: 3000,
  httpCompression: true,
}
let io = require('socket.io').listen(server, options);
require('./chat')(io,client);
app.set('socketio', io);

//Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

module.exports = app;
