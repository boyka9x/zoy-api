import { RedisService, SessionService } from "../../../services/index.js";
import { ShopBuilder } from "../builder/index.js";
import { PageviewBuilder } from "../builder/pageview.builder.js";

export const heatmapConsume = async (channel, message) => {
    let shopId = null;
    try {
        if (!message) {
            return channel.ack(message);
        }

        const data = JSON.parse(message.content.toString());
        shopId = data.shopId;

        if (ShopBuilder.isBuilding(shopId)) {
            console.log(`Shop ${shopId} is already building`);
            await RedisService.delete(`heatmap:shop:${shopId}`);
            return channel.ack(message);
        }

        ShopBuilder.add(shopId);

        console.log(`Building heatmap for shop ${shopId}`);

        // Building
        let sessions = [];
        const lastActive = new Date(Date.now() - 1000 * 60 * 30);

        do {
            sessions = await SessionService.findBuildHM({
                shopId,
                lastActive,
                limit: 100,
            });

            if (sessions.length) {
                for (const session of sessions) {
                    // Build pageview
                    await PageviewBuilder.buildHM({ sessionId: session._id, device: session.device });
                }
            }
        } while (sessions.length === 100);

        ShopBuilder.remove(shopId);
        console.log(`Finished building heatmap for shop ${shopId}`);
        await RedisService.delete(`heatmap:shop:${shopId}`);
        channel.ack(message);
    } catch (error) {
        ShopBuilder.remove(shopId);
        await RedisService.delete(`heatmap:shop:${shopId}`);
        console.error(`Error building heatmap for shop ${shopId}: ${error.message}`);
        channel.nack(message, false, false);
    }
}