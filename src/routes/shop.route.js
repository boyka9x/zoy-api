import Router from "koa-router";
import { ShopController } from "../controllers/shop.controller.js";

const shopRouter = new Router({
    prefix: '/api/shops'
});

shopRouter.post('/', ShopController.register);
shopRouter.get('/', async (ctx) => ctx.body = 'hi');

export default shopRouter;