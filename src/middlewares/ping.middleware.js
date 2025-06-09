import { AgentHelper } from "../helpers/index.js";
import { SessionService, ShopService } from "../services/index.js";
import geoip from 'geoip-lite';

export const verifyParams = async (ctx, next) => {
    const { _c, _s, _v, _p, _href, _w, _h, _t, domain, _px } = ctx.request.query;

    if (!_s || !_v || !_p) {
        ctx.throw(400, 'Invalid params');
    }

    ctx.state.zoy = {
        code: _c,
        sKey: _s,
        vKey: _v,
        pKey: _p,
        href: _href,
        domain,
        _w,
        _h,
        _t,
        isPixel: _px,
    };
    await next();
};

export const verifyIp = async (ctx, next) => {
    const xForwardedFor = ctx.request.headers['x-forwarded-for'];
    const ip =
        typeof xForwardedFor === 'string'
            ? xForwardedFor.split(',')[0].trim()
            : ctx.request.ip || ctx.req.socket?.remoteAddress;

    if (!ip) {
        ctx.throw(403, "Forbidden");
    }

    let location = 'VN';
    if (ip !== '::1' || ip !== '127.0.0.1') {
        const geo = geoip.lookup(ip);
        location = geo ? geo.country : 'VN';
    }

    ctx.state.zoy.ip = ip;
    ctx.state.zoy.location = location;
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

    if (shopData.session_count >= shopData?.pricing?.session_limit) {
        const session = await SessionService.findOneByKey({ shopId: shopData?._id, key: zoy.sKey });
        if (!session) {
            ctx.throw("Limit quota");
        }
    }

    if (zoy.domain) {
        return await next();
    }

    if (zoy.code !== shopData.code) {
        ctx.throw(401, "Invalid code");
    }

    await next();
}