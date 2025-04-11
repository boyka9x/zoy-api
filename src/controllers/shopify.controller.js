import { Logger } from "../helpers/index.js";

const __filename = import.meta.url;

export const ShopifyController = {
    get: async (ctx) => {
        const query = ctx.request.query;
        const body = ctx.request.body;

        try {
            console.log(query);
            console.log(body);

            ctx.body = {
                message: "ok",
            }
        } catch (error) {
            console.log(error)
            // Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
    post: async (ctx) => {
        const query = ctx.request.query;
        const body = ctx.request.body;

        try {
            console.log("post")
            console.log(query);
            console.log(body);

            ctx.body = {
                message: "ok",
            }
        } catch (error) {
            console.log(error)
            // Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    }
}