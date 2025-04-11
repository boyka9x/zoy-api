import Router from "koa-router";
import { ShopifyController } from "../controllers/shopify.controller.js";

const shopifyRouter = new Router({
    prefix: '/api/shopify'
});

shopifyRouter.get('/auth', ShopifyController.get);
shopifyRouter.post('/auth', ShopifyController.post);

export default shopifyRouter;