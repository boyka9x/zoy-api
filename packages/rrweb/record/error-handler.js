let errorHandler;
export function registerErrorHandler(handler) {
    errorHandler = handler;
}
export function unregisterErrorHandler() {
    errorHandler = undefined;
}
export const callbackWrapper = (cb) => {
    if (!errorHandler) {
        return cb;
    }
    const rrwebWrapped = ((...rest) => {
        try {
            return cb(...rest);
        }
        catch (error) {
            if (errorHandler && errorHandler(error) === true) {
                return;
            }
            throw error;
        }
    });
    return rrwebWrapped;
};
