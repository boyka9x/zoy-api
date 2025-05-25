import { Logger } from "../helpers/index.js";
import { ShopService } from "../services/shop.service.js";
import { ShopifyService } from "../services/shopify.service.js";

const __filename = import.meta.url;

export const ShopifyController = {
    post: async (ctx) => {
        const { domain, accessToken, pixelId } = ctx.request.body;

        try {
            if (!domain || !accessToken || !pixelId) {
                return ctx.throw(400, 'Invalid domain or access token');
            }

            const shop = await ShopService.findOne({ shopify_domain: domain }, { _id: 1, domain: 1 });
            if (!shop) {
                return ctx.throw(400, 'Shop not found');
            }

            await ShopService.updateOne(
                { shopify_domain: domain },
                { $set: { shopify_token: accessToken, pixel_id: pixelId } }
            );

            ctx.body = {
                message: "ok",
            }
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
}