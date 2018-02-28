const redis = require('redis');
//const client = redis.createClient();
var client = redis.createClient((process.env.REDISCLOUD_URL, {no_ready_check: true}) || 3000);

client.on('connect', () => console.log('connected to redis'));

module.exports = client;