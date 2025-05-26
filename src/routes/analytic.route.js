import Router from "koa-router";
import { AnalyticController } from "../controllers/analytic.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const analyticRouter = new Router({
    prefix: '/api/analytics'
});

analyticRouter.get('/visitor-by-date', verifyToken, AnalyticController.visitorByDate);
analyticRouter.get('/session-by-date', verifyToken, AnalyticController.sessionByDate);
analyticRouter.get('/top-pages', verifyToken, AnalyticController.topPages);
analyticRouter.get('/session-analytic', verifyToken, AnalyticController.analyticSessions);
analyticRouter.get('/session-by-source', verifyToken, AnalyticController.groupBySource);
analyticRouter.get('/session-by-type', verifyToken, AnalyticController.groupByType);

export default analyticRouter;