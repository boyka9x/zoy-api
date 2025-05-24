import Router from "koa-router";
import { SessionController } from "../controllers/session.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const sessionRouter = new Router({
    prefix: '/api/sessions'
});

sessionRouter.get('/', verifyToken, SessionController.findAll);
sessionRouter.get('/last-24h', verifyToken, SessionController.countLast24H);
sessionRouter.post('/by-ids', verifyToken, SessionController.getByIds);

export default sessionRouter;