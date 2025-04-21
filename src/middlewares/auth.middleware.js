import { ShopService } from "../services/index.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (ctx, next) => {
    const token = ctx.request.headers['authorization']?.split(' ')[1];
    if (!token) {
        ctx.throw(401, 'Unauthorized');
    }

    try {
        const { domain } = jwt.verify(token, process.env.JWT_SECRET);
        if (!domain) {
            ctx.throw(401, 'Unauthorized');
        }

        const shop = await ShopService.findOne({ domain });
        if (!shop) {
            ctx.throw(401, 'Unauthorized');
        }

        ctx.state.shopData = shop;
        await next();
    } catch (err) {
        ctx.throw(401, 'Unauthorized');
    }
}