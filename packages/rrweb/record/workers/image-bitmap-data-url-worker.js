function funcToSource(fn, sourcemapArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var source = fn.toString();
    var lines = source.split('\n');
    lines.pop();
    lines.shift();
    var blankPrefixLength = lines[0].search(/\S/);
    var regex = /(['"])__worker_loader_strict__(['"])/g;
    for (var i = 0, n = lines.length; i < n; ++i) {
        lines[i] = lines[i].substring(blankPrefixLength).replace(regex, '$1use strict$2') + '\n';
    }
    if (sourcemap) {
        lines.push('//# sourceMappingURL=' + sourcemap + '\n');
    }
    return lines;
}
function createURL(fn, sourcemapArg) {
    var lines = funcToSource(fn, sourcemapArg);
    var blob = new Blob(lines, { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createInlineWorkerFactory(fn, sourcemapArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(fn, sourcemapArg);
        return new Worker(url, options);
    };
}
var WorkerFactory = createInlineWorkerFactory(
    /* rollup-plugin-web-worker-loader */ function () {
        (function () {
            '__worker_loader_strict__';

            /*
             * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
             * Copyright (c) 2021 Niklas von Hertzen <https://hertzen.com>
             * Released under MIT License
             */
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            // Use a lookup table to find the index.
            var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
            for (var i = 0; i < chars.length; i++) {
                lookup[chars.charCodeAt(i)] = i;
            }
            var encode = function (arraybuffer) {
                var bytes = new Uint8Array(arraybuffer),
                    i,
                    len = bytes.length,
                    base64 = '';
                for (i = 0; i < len; i += 3) {
                    base64 += chars[bytes[i] >> 2];
                    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                    base64 += chars[bytes[i + 2] & 63];
                }
                if (len % 3 === 2) {
                    base64 = base64.substring(0, base64.length - 1) + '=';
                } else if (len % 3 === 1) {
                    base64 = base64.substring(0, base64.length - 2) + '==';
                }
                return base64;
            };

            const lastBlobMap = /* @__PURE__ */ new Map();
            const transparentBlobMap = /* @__PURE__ */ new Map();
            async function getTransparentBlobFor(width, height, dataURLOptions) {
                const id = `${width}-${height}`;
                if ('OffscreenCanvas' in globalThis) {
                    if (transparentBlobMap.has(id)) return transparentBlobMap.get(id);
                    const offscreen = new OffscreenCanvas(width, height);
                    offscreen.getContext('2d');
                    const blob = await offscreen.convertToBlob(dataURLOptions);
                    const arrayBuffer = await blob.arrayBuffer();
                    const base64 = encode(arrayBuffer);
                    transparentBlobMap.set(id, base64);
                    return base64;
                } else {
                    return '';
                }
            }
            const worker = self;
            worker.onmessage = async function (e) {
                if ('OffscreenCanvas' in globalThis) {
                    const { id, bitmap, width, height, dataURLOptions } = e.data;
                    const transparentBase64 = getTransparentBlobFor(width, height, dataURLOptions);
                    const offscreen = new OffscreenCanvas(width, height);
                    const ctx = offscreen.getContext('2d');
                    ctx.drawImage(bitmap, 0, 0);
                    bitmap.close();
                    const blob = await offscreen.convertToBlob(dataURLOptions);
                    const type = blob.type;
                    const arrayBuffer = await blob.arrayBuffer();
                    const base64 = encode(arrayBuffer);
                    if (!lastBlobMap.has(id) && (await transparentBase64) === base64) {
                        lastBlobMap.set(id, base64);
                        return worker.postMessage({ id });
                    }
                    if (lastBlobMap.get(id) === base64) return worker.postMessage({ id });
                    worker.postMessage({
                        id,
                        type,
                        base64,
                        width,
                        height,
                    });
                    lastBlobMap.set(id, base64);
                } else {
                    return worker.postMessage({ id: e.data.id });
                }
            };
        })();
    },
    null
);

export default WorkerFactory;
