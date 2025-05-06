
export const ClickController = {
    getAll: async (ctx) => {
        const { _id: shopId } = ctx.state.shopData;
        const { page, type, device, from, to } = ctx.request.query;

        try {
            const clicks = await ClickService.findAll({ shopId, page, type, device, from, to });
            ctx.body = {
                data: clicks,
            }
        } catch (error) {
            ctx.throw(error.status, error.message);
        }
    },
}