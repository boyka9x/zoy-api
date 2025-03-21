import { Logger } from "../../../helpers/index.js";
import { PageviewService, SessionService, ShopService, VisitorService } from "../../../services/index.js";

export const handlePingConsume = async (channel, domain, message) => {
    try {
        if (message === null) {
            Logger.info(__filename, domain, 'Invalid message');
            return;
        }

        const { domain, zoy, body } = JSON.parse(message.content.toString());

        const shop = await ShopService.findByDomain(domain);
        const { _id: shopId, session_count } = shop;

        if (!shopId) {
            channel.ack(message);
            return;
        }

        const { sessionKey, visitorKey } = zoy;
        const visitor = await VisitorService.findOne({ shopId, visitorKey });
        const session = await SessionService.findOne({ shopId, sessionKey });
        const pageview = await PageviewService.findOne({ shopId, sessionKey });
        console.log(data);


        channel.ack(message);
    } catch (e) {
        Logger.error(__filename, domain, e);
        channel.ack(message);
    }
};

