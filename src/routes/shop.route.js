import Router from "koa-router";
import { ShopController } from "../controllers/shop.controller.js";

const shopRouter = new Router({
    prefix: '/api/shops'
});

shopRouter.post('/', ShopController.register);
shopRouter.post('/login', ShopController.login);

export default shopRouter;