export const SseHelper = {
    create: (ctx) => {
        ctx.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': '*',
        });

        ctx.status = 200;
        ctx.req.socket.setTimeout(0);
        ctx.req.socket.setNoDelay(true);
        ctx.req.socket.setKeepAlive(true);

        const control = {
            isClosed: false,
            emit(options) {
                let res = [];
                if (options?.name) {
                    res.push(`event: ${options.name}`);
                }
                if (options?.retryAfter) {
                    res.push(`retry: ${options.retryAfter}`);
                }
                if (options?.id) {
                    res.push(`id: ${options.id}`);
                }
                if (options?.data) {
                    res.push('data: ' + JSON.stringify(options.data));
                }
                let str = res.join('\n') + '\n\n';
                ctx.res.write(str);
            },
            close() {
                if (process.env.NODE_ENV !== 'production') {
                    info(__filename, ' ', 'SSE connection is closed');
                }
                control.isClosed = true;
                if (!ctx.res.writableEnded && !ctx.req.aborted) {
                    control.emit({
                        name: 'closed',
                    });
                    ctx.res.end();
                }
            },
        };

        ctx.req.on('close', control.close);

        return control;
    },
}