import Router from "koa-router";
import { ShopifyController } from "../controllers/shopify.controller.js";

const shopifyRouter = new Router({
    prefix: '/api/shopify'
});

shopifyRouter.post('/auth', ShopifyController.post);

export default shopifyRouter;