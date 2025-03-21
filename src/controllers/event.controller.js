import { Logger } from "../helpers/index.js";
import { EventService } from "../services/index.js";

const __filename = import.meta.url;

export const EventController = {
    find: async (ctx) => {
        const { sessionId } = ctx.request.query;

        try {
            const events = await EventService.findBySession(sessionId);

            ctx.body = {
                data: events
            }
        } catch (error) {
            console.log(error)
            // Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    }
}