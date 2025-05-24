import { PingChannel } from "../configs/index.js";
import { Logger } from "../helpers/index.js";

const __filename = import.meta.url;

export const pingController = {
    create: async (ctx) => {
        const { domain } = ctx.state.shopData;

        try {
            PingChannel.publish(domain, {
                domain,
                body: ctx.request.body,
                zoy: ctx.state.zoy,
            });

            ctx.body = {
                block: false,
                message: 'OK'
            }
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    }
}