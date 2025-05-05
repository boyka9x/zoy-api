import { Logger } from "../../helpers/index.js";
import { createClient } from "redis";

const __filename = import.meta.url;

export const redisClient = createClient({
    url: process.env.REDIS_URI,
});

redisClient.connect().then(() => {
    Logger.info(__filename, 'Redis', 'Connect ok');
});

redisClient.on('error', (e) => {
    Logger.error(__filename, 'Redis', e.message);
});

redisClient.on('close', () => {
    Logger.info(__filename, 'Redis', 'Connect closed');
});

