import { clientError, Logger } from "../helpers/index.js";
import { ShopService } from "../services/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const shopController = {
    register: async (ctx) => {
        const { username, pw, pwConfirm, email, domain } = ctx.request.body;

        try {
            console.log('ha')
            if (!username || !pw || !email || !domain) {
                return clientError(ctx, 400, 'Invalid username or password');
            }

            if (pw !== pwConfirm) {
                return clientError(ctx, 400, 'Password not match');
            }

            // Check if email used
            const shop = await ShopService.findOne({ email });
            if (shop) {
                return clientError(ctx, 400, "User existed");
            }

            const salt = await bcrypt.genSalt(10);
            const hashPw = await bcrypt.hash(pw, salt);
            await ShopService.create({
                username,
                email,
                password: hashPw,
                domain,
                code: Math.random().toString(36).slice(2, 10).toUpperCase()
            });

            ctx.body = {
                message: "User saved!"
            };
        } catch (error) {
            Logger.error(__filename, domain, error.message);
            ctx.throw(error.status, error.message);
        }
    },
    login: async (ctx) => {
        const { email, password } = ctx.request.body;

        try {
            if (!email || !password) {
                return clientError(ctx, 400, 'Invalid email or password');
            }

            const shop = await ShopService.findOne({ email });
            if (!shop) {
                return clientError(ctx, 400, 'Invalid email or password');
            }

            const isWatch = await bcrypt.compare(password, shop.password);
            if (!isWatch) {
                return clientError(ctx, 400, 'Incorrect');
            }

            const accessToken = jwt.sign(
                {
                    domain: shop.domain,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_TIME
                }
            );

            ctx.body = {
                token: accessToken
            };
        } catch (error) {
            Logger.error(__filename, email, error.message);
            ctx.throw(error.status, error.message);
        }
    },
}