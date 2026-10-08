const Redis = require('ioredis');

const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
});

redisClient.on('connect', () => {
    console.log('Redis connected');
});

redisClient.on('error', (error) => {
    console.error('Redis error:', error);
});

module.exports = redisClient;