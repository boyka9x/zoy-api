import { Logger } from "../helpers/index.js";
import { SessionService } from "../services/index.js";

const __filename = import.meta.url;

export const SessionController = {
    findAll: async (ctx) => {
        const { _id, domain } = ctx.state.shopData;
        const { page, limit } = ctx.request.query;

        try {
            const _page = isNaN(page) ? 1 : parseInt(page);
            const _limit = isNaN(limit) ? 10 : parseInt(limit);
            const sessions = await SessionService.find({ shop: _id }, { skip: (_page - 1) * _limit, limit: _limit }).sort({ lastActive: -1 });

            const total = await SessionService.count({ shop: _id });

            ctx.body = {
                data: sessions,
                page: _page,
                limit: _limit,
                total,
            }
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
    }
};