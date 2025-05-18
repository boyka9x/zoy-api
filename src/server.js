import Koa from "koa";
import dotenv from "dotenv";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import serve from 'koa-static';
import { userAgent } from 'koa-useragent';
import path from 'path';
import { route } from "./routes/index.js";
import { connectMongoDB, initRabbit } from "./configs/index.js";
import { Auto } from "./auto/index.js";

// Environment config
dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 5000;

// Error handling
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: err.status !== 500 ? err.message : 'Internal server error',
        };
    }
});

app.use(cors());
app.use(bodyParser({
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb'
}));
app.use(serve(path.join(process.cwd(), 'src/public')));
app.use(userAgent);

// Init routes
route(app);

app.listen(PORT, async function () {
    await connectMongoDB();
    await initRabbit();
    Auto.init();
    console.log(`Server is running on port ${PORT}`);
});