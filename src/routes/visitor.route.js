import Router from "koa-router";
import { VisitorController } from "../controllers/visitor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const visitorRouter = new Router({
    prefix: '/api/visitors'
});

visitorRouter.get('/', verifyToken, VisitorController.findAll);

export default visitorRouter;