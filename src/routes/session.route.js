import Router from "koa-router";
import { SessionController } from "../controllers/session.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const sessionRouter = new Router({
    prefix: '/api/sessions'
});

sessionRouter.get('/', verifyToken, SessionController.findAll);

export default sessionRouter;