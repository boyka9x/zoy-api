import { HeatmapChannel } from "../configs/rabbitmq/channel/heatmap.channel.js";
import { Logger } from "../helpers/index.js";
import { ShopService } from "../services/index.js";
import { RedisService } from "../services/redis.service.js";

const __filename = import.meta.url;

export const HeatmapAuto = {
    buildShop: async () => {
        try {
            const shopCursor = ShopService.findBuildHM().cursor();

            await shopCursor.eachAsync(async (shop) => {
                const shopInQueue = await RedisService.get(`heatmap:shop:${shop._id}`);
                if (!shopInQueue) {
                    await RedisService.set(`heatmap:shop:${shop._id}`, 'true', { EX: 60 * 60 * 24 });
                    HeatmapChannel.publish({
                        shopId: shop._id,
                        domain: shop.domain,
                    });
                }
            });

            await shopCursor.close();
        } catch (e) {
            Logger.error(__filename, 'APP', `Schedule build heatmap error: ` + e.message);
        }
    }
}