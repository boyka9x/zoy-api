import Router from "koa-router";
import { ClickController } from "../controllers/click.controller.js";

const clickRouter = new Router({
    prefix: '/api/clicks'
});

clickRouter.get('/', ClickController.getAll);

export default clickRouter;