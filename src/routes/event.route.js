import Router from "koa-router";
import { EventController } from "../controllers/event.controller.js";

const eventRouter = new Router({
    prefix: '/api/events'
});

eventRouter.get('/', EventController.find);

export default eventRouter;