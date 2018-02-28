const redis = require('redis');
const url = require('url');
//const client = redis.createClient();
const redisURL = url.parse(process.env.REDISCLOUD_URL);
const client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

client.on('connect', () => console.log('connected to redis'));

module.exports = client;