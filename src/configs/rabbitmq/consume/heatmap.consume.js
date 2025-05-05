import { RedisService, SessionService } from "../../../services/index.js";
import { ShopBuilder } from "../builder/index.js";

export const heatmapConsume = async (channel, message) => {
    let id;
    try {
        if (!message) {
            return channel.ack(message);
        }

        const data = JSON.parse(message.content.toString());
        id = data._id;

        if (ShopBuilder.isBuilding(id)) {
            console.log(`Shop ${id} is already building`);
            await RedisService.delete(`heatmap:shop:${id}`);
            return channel.ack(message);
        }

        ShopBuilder.add(id);

        console.log(`Building heatmap for shop ${id}`);

        // Building
        let sessions = [];
        const lastActive = new Date(Date.now() - 1000 * 60 * 30);

        do {
            sessions = await SessionService.findBuildHM({
                shopId: id,
                lastActive,
                limit: 100,
            });

            if (sessionStorage.length) {
                for (const session of sessions) {

                }
            }
        } while (sessions.length === 100);

        ShopBuilder.remove(id);
        console.log(`Finished building heatmap for shop ${id}`);
        await RedisService.delete(`heatmap:shop:${id}`);
        channel.ack(message);
    } catch (error) {
        ShopBuilder.remove(id);
        await RedisService.delete(`heatmap:shop:${id}`);
        console.error(`Error building heatmap for shop ${id}: ${error.message}`);
        channel.nack(message, false, false);
    }
}