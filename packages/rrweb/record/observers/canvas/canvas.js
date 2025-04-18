import { isBlocked, patch } from '../../../utils';
function getNormalizedContextName(contextType) {
    return contextType === 'experimental-webgl' ? 'webgl' : contextType;
}
export default function initCanvasContextObserver(win, blockClass, blockSelector, setPreserveDrawingBufferToTrue) {
    const handlers = [];
    try {
        const restoreHandler = patch(win.HTMLCanvasElement.prototype, 'getContext', function (original) {
            return function (contextType, ...args) {
                if (!isBlocked(this, blockClass, blockSelector, true)) {
                    const ctxName = getNormalizedContextName(contextType);
                    if (!('__context' in this)) this.__context = ctxName;
                    if (setPreserveDrawingBufferToTrue && ['webgl', 'webgl2'].includes(ctxName)) {
                        if (args[0] && typeof args[0] === 'object') {
                            const contextAttributes = args[0];
                            if (!contextAttributes.preserveDrawingBuffer) {
                                contextAttributes.preserveDrawingBuffer = true;
                            }
                        } else {
                            args.splice(0, 1, {
                                preserveDrawingBuffer: true,
                            });
                        }
                    }
                }
                return original.apply(this, [contextType, ...args]);
            };
        });
        handlers.push(restoreHandler);
    } catch (_a) {
        console.error('failed to patch HTMLCanvasElement.prototype.getContext');
    }
    return () => {
        handlers.forEach((h) => h());
    };
}
