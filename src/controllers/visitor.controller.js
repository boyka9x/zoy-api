import { VisitorService } from "../services/index.js";

export const VisitorController = {
    findAll: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;
        const { page, limit } = ctx.request.query;

        try {
            const _page = isNaN(page) ? 1 : parseInt(page);
            const _limit = isNaN(limit) ? 6 : parseInt(limit);


            const visitors = await VisitorService.findAll({
                shopId, skip: (_page - 1) * _limit,
                limit: _limit,
            });
            if (!visitors || visitors.length === 0) {
                ctx.throw(404, "No visitors found for this shop");
            }

            const total = await VisitorService.count({ shopId });

            ctx.body = {
                data: visitors,
                page: _page,
                limit: _limit,
                total,
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
};