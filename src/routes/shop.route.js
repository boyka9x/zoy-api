import Router from "koa-router";
import { shopController } from "../controllers/shop.controller.js";

const shopRouter = new Router({
    prefix: '/api/shops'
});

shopRouter.post('/', shopController.register);
shopRouter.get('/', async (ctx) => ctx.body = 'hi');

export default shopRouter;