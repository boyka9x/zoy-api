import Router from "koa-router";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { PageviewController } from "../controllers/pageview.controller.js";

const pageviewRouter = new Router({
    prefix: '/api/pageviews'
});

pageviewRouter.get('/list-page', verifyToken, PageviewController.pageList);

export default pageviewRouter;