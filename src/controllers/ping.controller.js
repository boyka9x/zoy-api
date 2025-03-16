import { Logger } from "../helpers/index.js";

const __filename = import.meta.url;

export const pingController = {
    create: async (ctx, next) => {
        const { domain } = ctx.state.shopData;

        try {

        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    }
}