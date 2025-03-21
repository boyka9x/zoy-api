import { AgentHelper } from "../helpers/index.js";
import { ShopService } from "../services/index.js";

export const verifyParams = async (ctx, next) => {
    const { _c, _s, _v, _p, _href, _w, _h, _t } = ctx.request.query;

    if (!_c || !_s || !_v || !_p) {
        ctx.throw(400, 'Invalid params');
    }

    ctx.state.zoy = {
        code: _c,
        sKey: _s,
        vKey: _v,
        pKey: _p,
        href: _href,
        _w,
        _h,
        _t,
    };
    await next();
};

export const verifyIp = async (ctx, next) => {
    const ip = ctx.request.ip;

    if (!ip) {
        ctx.throw(403, "Forbidden");
    }

    ctx.state.zoy.ip = ip;
    await next();
};

export const verifyShop = async (ctx, next) => {
    const { domain } = ctx.request.query || ctx.request.body;

    if (!domain) {
        ctx.throw(400, "No domain");
    }

    const shop = await ShopService.findByDomain(domain);
    if (!shop || !shop.status) {
        ctx.throw(400, "Shop not found");
    }

    ctx.state.shopData = shop;
    if (!ctx.state.zoy) ctx.state.zoy = {};
    await next();
};

export const verifyAgent = async (ctx, next) => {
    const ua = ctx.userAgent;

    ctx.state.zoy.os = AgentHelper.getOs(ua);
    ctx.state.zoy.device = AgentHelper.getDevice(ua);
    ctx.state.zoy.browser = AgentHelper.getBrowser(ua);
    await next();

};

export const verifyQuota = async (ctx, next) => {
    const { zoy, shopData } = ctx.state;

    if (zoy.code !== shopData.code) {
        ctx.throw(401, "Invalid code");
    }

    await next();
}