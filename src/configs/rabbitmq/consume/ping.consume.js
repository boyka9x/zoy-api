import { Logger } from "../../../helpers/index.js";
import { BehaviorService, EventService, PageviewService, SessionService, ShopService, VisitorService } from "../../../services/index.js";
import { SessionHelper } from "../../../helpers/index.js";

const __filename = import.meta.url;

export const handlePingConsume = async (channel, domain, message) => {
    try {
        if (message === null) {
            Logger.info(__filename, domain, 'Invalid message');
            channel, ack(message);
            return;
        }

        const { domain, zoy, body } = JSON.parse(message.content.toString());
        const { events, source } = body;
        if (!events || events.length === 0) {
            channel.ack(message);
            return;
        }

        const shop = await ShopService.findByDomain(domain);
        const { _id: shopId, session_count, pricing, count_visitors = 0 } = shop;

        if (!shopId || session_count >= pricing.session_limit) {
            channel.ack(message);
            return;
        }

        const { sKey, vKey, pKey, os, device, browser, ip, href, _w, _h, _t, isPixel } = zoy;
        const startTime = events[0].timestamp;
        const lastActive = events[events.length - 1].timestamp;

        let visitor = await VisitorService.findOne({ shopId, key: vKey });
        const visitorData = {
            os,
            device,
            browser,
            lastActive,
        };

        if (!visitor) {
            visitor = await VisitorService.create({
                ...visitorData,
                shop: shopId,
                key: vKey,
                ips: [ip],
                display_id: count_visitors + 1,
                location: zoy.location || 'VN',
            });

            await ShopService.updateOne({ _id: shopId }, {
                $inc: { count_visitors: 1 }
            });
        } else {
            await VisitorService.updateOne(visitor._id, {
                ...visitorData,
                $addToSet: { ips: ip }
            })
        }

        let session = await SessionService.findOne({ visitorId: visitor._id, key: sKey });
        const sessionData = {
            os,
            device,
            browser,
            ip,
            lastActive,
        }
        if (!session) {
            session = await SessionService.create({
                ...sessionData,
                startTime,
                duration: Math.round((lastActive - startTime) / 1000),
                shop: shopId,
                key: sKey,
                visitor: visitor._id,
                source: SessionHelper.getSourceInfo(source),
                location: zoy.location || 'VN',
            })

            await ShopService.updateOne({ _id: shopId }, {
                $inc: { session_count: 1 }
            });
        } else {
            await SessionService.updateOne(session._id, {
                duration: Math.round((lastActive - session.startTime) / 1000),
            });
        }

        let pageview = await PageviewService.findOne({ sessionId: session._id, key: pKey });
        if (!pageview) {
            pageview = await PageviewService.create({
                shop: shopId,
                key: pKey,
                session: session._id,
                href,
                title: _t,
                width: _w ? parseInt(_w) : 0,
                height: _h ? parseInt(_h) : 0,
                startTime,
            });
        }

        await EventService.createMany({ pageviewId: pageview._id, events });
        if (isPixel) {
            const behaviors = events.map(event => ({
                type: event.data.tag,
                data: event.data.payload || {},
                timestamp: event.timestamp,
                pageview: pageview._id,
                session: session._id,
                shop: shopId,
            }));
            await BehaviorService.createMany(behaviors);
        }
        channel.ack(message);
    } catch (e) {
        Logger.error(__filename, domain, e);
        channel.ack(message);
    }
};

