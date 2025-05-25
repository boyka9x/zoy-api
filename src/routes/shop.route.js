import Router from "koa-router";
import { ShopController } from "../controllers/shop.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const shopRouter = new Router({
    prefix: '/api/shops'
});

shopRouter.get('/', verifyToken, ShopController.getShop);
shopRouter.post('/', ShopController.register);
shopRouter.post('/login', ShopController.login);
shopRouter.post('/modules', verifyToken, ShopController.changeModule);
shopRouter.get('/check-shopify', verifyToken, ShopController.checkShopify);
shopRouter.post('/sub-pricing', verifyToken, ShopController.subPricing);
shopRouter.post('/update-integration', verifyToken, ShopController.integration);

export default shopRouter;