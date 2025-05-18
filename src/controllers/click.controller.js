import { ShopBuilder } from "../configs/rabbitmq/builder/index.js";
import { PageviewBuilder } from "../configs/rabbitmq/builder/pageview.builder.js";
import { ClickService } from "../services/click.service.js";
import { ShopService } from "../services/shop.service.js";

export const ClickController = {
    getAll: async (ctx) => {
        const { shopId, page, type, device, from, to } = ctx.request.query;

        try {
            if (!shopId || !page) {
                ctx.throw(400, "Invalid parameters");
            }

            const shop = await ShopService.findOne({ _id: shopId }, { _id: 1 });
            if (!shop) {
                ctx.throw(404, "Shop not found");
            }

            const shopsInBuild = ShopBuilder.get();
            if (!shopsInBuild.includes(shop._id.toString())) {
                await PageviewBuilder.buildRealtimeHM({ shopId: shop._id, href: page, device });
            }

            const clicks = await ClickService.findAll({ shopId: shop._id, page, type, device, from, to });

            ctx.body = {
                data: clicks,
            }
        } catch (error) {
            console.log(error)
            ctx.throw(error.status, error.message);
        }
    },
}