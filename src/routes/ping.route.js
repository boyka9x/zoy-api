import Router from "koa-router";
import { pingController } from "../controllers/ping.controller.js";
import { verifyAgent, verifyIp, verifyParams, verifyQuota, verifyShop } from "../middlewares/ping.middleware.js";

const pingRouter = new Router({
    prefix: '/ping'
});

pingRouter.post('/', verifyParams, verifyIp, verifyShop, verifyQuota, verifyAgent, pingController.create);

export default pingRouter;