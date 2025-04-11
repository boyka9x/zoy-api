import compose from "koa-compose";
import pingRouter from "./ping.route.js";
import shopRouter from "./shop.route.js";
import sessionRouter from "./session.route.js";
import eventRouter from "./event.route.js";
import shopifyRouter from "./shopify.route.js";

const routes = [pingRouter, shopRouter, sessionRouter, eventRouter, shopifyRouter];

export const route = (app) => {
    app.use(compose(routes.map(r => r.routes())));
    app.use(compose(routes.map(r => r.allowedMethods())));

    app.use((ctx) => {
        ctx.status = 404;
        ctx.body = {
            message: "Not found"
        }
    });
}