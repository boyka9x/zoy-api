import Router from "koa-router";
import { SessionController } from "../controllers/session.controller.js";

const sessionRouter = new Router({
    prefix: '/api/sessions'
});

sessionRouter.get('/', SessionController.findAll);

export default sessionRouter;