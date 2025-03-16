import compose from "koa-compose";
import pingRouter from "./ping.route.js";

const routes = [pingRouter];

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