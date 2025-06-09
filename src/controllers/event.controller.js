import { Logger } from "../helpers/index.js";
import { EventService, PageviewService, SessionService } from "../services/index.js";

const __filename = import.meta.url;

export const EventController = {
    find: async (ctx) => {
        const { sessionId } = ctx.request.query;

        try {
            const events = await EventService.findBySession(sessionId);

            await SessionService.updateOne(sessionId, { viewed: true });

            ctx.body = {
                data: events
            }
        } catch (error) {
            console.log(error)
            // Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
    findSnapshot: async (ctx) => {
        const { shopId, page, device } = ctx.request.body;

        try {
            const pageview = await PageviewService.findLast({ shopId, href: page, device });
            if (!pageview || !pageview[0]?._id) {
                ctx.throw(404, "Pageview not found");
            }

            const events = await EventService.findSnapshot(pageview[0]._id);
            if (!events) {
                ctx.throw(404, "Events not found");
            }

            ctx.body = {
                data: events
            }
        } catch (error) {
            console.log(error)
            ctx.throw(error.status, error.message);
        }
    },
}