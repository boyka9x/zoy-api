import { redisClient } from "../configs/index.js";

export const RedisService = {
    set: async (key, value, options = {}) => {
        return await redisClient.set(key, value, options);
    },

    get: async (key) => {
        return await redisClient.get(key);
    },

    delete: async (key) => {
        return await redisClient.del(key);
    },
};