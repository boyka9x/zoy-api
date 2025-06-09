import { Logger } from "../helpers/index.js";
import { SessionService } from "../services/index.js";

const __filename = import.meta.url;

export const SessionController = {
    findAll: async (ctx) => {
        const { _id, domain } = ctx.state.shopData;
        const { page, limit, date } = ctx.request.query;

        try {
            const _page = isNaN(page) ? 1 : parseInt(page);
            const _limit = isNaN(limit) ? 10 : parseInt(limit);

            const query = { shop: _id };

            if (date !== "null") {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);
                query.lastActive = { $gte: start, $lte: end };
            }

            const sessions = await SessionService.find(query, {
                skip: (_page - 1) * _limit,
                limit: _limit,
            }).sort({ lastActive: -1 });

            const total = await SessionService.count(query);

            ctx.body = {
                data: sessions,
                page: _page,
                limit: _limit,
                total,
            };
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
    countLast24H: async (ctx) => {
        const { _id, domain } = ctx.state.shopData;

        try {
            const total = await SessionService.countLast24H({ shopId: _id });

            ctx.body = {
                data: total
            }
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
    getByIds: async (ctx) => {
        const { _id, domain } = ctx.state.shopData;
        const { ids } = ctx.request.body;

        try {
            if (!ids) {
                ctx.throw(400, 'Ids are required');
            }

            const sessions = await SessionService.find({ shop: _id, _id: { $in: ids } }, { skip: 0, limit: 10 });

            ctx.body = {
                data: sessions
            }
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    }
};