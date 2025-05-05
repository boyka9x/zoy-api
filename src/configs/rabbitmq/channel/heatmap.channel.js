import { heatmapConsume } from "../consume/heatmap.consume.js";

const __filename = import.meta.url;
export const HeatmapChannel = (() => {
    let channel;

    const initial = async (conn) => {
        try {
            channel = await conn.createChannel();
            await channel.assertQueue('heatmap', { durable: true });

            channel.prefetch(1, false);
            channel.consume('heatmap', (message) => heatmapConsume(channel, message));
        } catch (e) {
            console.error('AMQP : ', e.toString());
        }
    }

    const publish = (message) => {
        channel.sendToQueue('heatmap', Buffer.from(JSON.stringify(message)), { persistent: true });
    }

    return {
        initial,
        publish,
    };
})();

