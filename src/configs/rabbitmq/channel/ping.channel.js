import { Logger } from "../../../helpers";
import { ShopService } from "../../../services";
import { handlePingConsume } from "../consume/ping.consume.js";

export const PingChannel = (function () {
    let channel;

    const initialize = async (conn) => {
        try {
            channel = await conn.createChannel();
            await channel.assertExchange('domain', 'direct', { durable: true });
            channel.prefetch(1, false);
            const activeShops = await ShopService.findAll({ status: true }, { domain: 1 });
            const inactiveShops = await ShopService.findAll({ status: false }, { domain: 1 });

            for (const shop of activeShops) {
                await publish(shop.domain);
            }

            for (const shop of inactiveShops) {
                await stop(shop.domain);
            }
        } catch (e) {
            Logger.error(__filename, '', `AMQP : ${e.toString()}`);
        }
    };

    const publish = async (domain) => {
        await channel.assertQueue(domain);
        await channel.bindQueue(domain, 'domain', domain);
        channel.consume(domain, (message) => handlePingConsume(channel, domain, message));
    };

    const stop = async (domain) => {
        try {
            await channel.deleteQueue(domain);
        } catch (e) {
            Logger.error(__filename, domain, 'error: ' + e.toString());
        }
    };

    return {
        initialize,
        publish,
        stop,
    };
})();
