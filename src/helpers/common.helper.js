export const clientError = (ctx, status = 500, message = 'Internal server error') => {
    ctx.status = status || 500;
    ctx.body = {
        message
    };
}