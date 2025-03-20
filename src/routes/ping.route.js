import Router from "koa-router";
import { pingController } from "../controllers/ping.controller.js";
import { verifyAgent, verifyParams, verifyShop } from "../middlewares/auth.middleware.js";

const pingRouter = new Router({
    prefix: '/ping'
});

pingRouter.post('/', verifyParams, verifyShop, verifyAgent, pingController.create);

export default pingRouter;