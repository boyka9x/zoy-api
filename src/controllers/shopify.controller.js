import { Logger } from "../helpers/index.js";

const __filename = import.meta.url;

export const ShopifyController = {
    post: async (ctx) => {
        const { domain, accessToken } = ctx.request.body;

        try {

            ctx.body = {
                message: "ok",
            }
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
}