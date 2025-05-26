import { BehaviorService, PageviewService, SessionService, VisitorService } from "../services/index.js";

export const AnalyticController = {
    visitorByDate: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {
            const visitor = await VisitorService.groupByDate({ shopId });
            if (!visitor || visitor.length === 0) {
                ctx.throw(404, "No visitors found for this shop");
            }

            ctx.body = {
                data: visitor[0].byDate,
                total: visitor[0].total || 0
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
    sessionByDate: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {
            const session = await SessionService.groupByDate({ shopId });
            if (!session || session.length === 0) {
                ctx.throw(404, "No sessions found for this shop");
            }

            ctx.body = {
                data: session[0].byDate,
                total: session[0].total || 0
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
    topPages: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {

            const topPages = await PageviewService.getTopPages({ shopId });
            if (!topPages || topPages.length === 0) {
                ctx.throw(404, "No top pages found for this shop");
            }

            ctx.body = {
                data: topPages
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
    analyticSessions: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {
            const sessions = await SessionService.analytic({ shopId });
            if (!sessions || sessions.length === 0) {
                ctx.throw(404, "No sessions found for this shop");
            }

            ctx.body = {
                data: sessions[0]
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
    groupBySource: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {
            const sources = await SessionService.groupBySource({ shopId });
            if (!sources || sources.length === 0) {
                ctx.throw(404, "No sources found for this shop");
            }

            ctx.body = {
                data: sources
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
    groupByType: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {
            const types = await BehaviorService.groupByType({ shopId });
            if (!types || types.length === 0) {
                ctx.throw(404, "No types found for this shop");
            }

            ctx.body = {
                data: types
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    }
};