import { VisitorService } from "../services/index.js";

export const VisitorController = {
    findAll: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;

        try {
            const visitors = await VisitorService.findAll({ shopId });
            if (!visitors || visitors.length === 0) {
                ctx.throw(404, "No visitors found for this shop");
            }

            ctx.body = {
                data: visitors
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
};