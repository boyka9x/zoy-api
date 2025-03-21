import { Logger } from "../helpers/index.js";
import { SessionService } from "../services/index.js";

const __filename = import.meta.url;

export const SessionController = {
    findAll: async (ctx) => {
        try {
            const sessions = await SessionService.find();

            ctx.body = {
                data: sessions
            }
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    }
};