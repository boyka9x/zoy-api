import { PageviewService } from "../services/pageview.service.js";

export const PageviewController = {
    pageList: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;
        const { from, to, page, limit } = ctx.request.query;

        try {
            const _page = parseInt(page) || 1;
            const _limit = parseInt(limit) || 5;

            const pageviews = await PageviewService.listPage({
                shopId,
                from,
                to,
                limit: _limit,
                skip: (_page - 1) * _limit,
            });

            const total = await PageviewService.countPage({
                shop: shopId,
                from,
                to,
            });

            ctx.body = {
                data: [{
                    href: "/home",
                    counts: 120,
                    device: {
                        desktop: 80,
                        mobile: 35,
                        tablet: 5
                    }
                }],
                page: _page,
                limit: _limit,
                total: total[0]?.total || 0,
            };
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    }
}