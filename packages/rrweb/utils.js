import { isShadowRoot, IGNORED_NODE, classMatchesRegex } from './rrweb-snapshot';
export function on(type, fn, target = document) {
    const options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return () => target.removeEventListener(type, fn, options);
}
const DEPARTED_MIRROR_ACCESS_WARNING =
    'Please stop import mirror directly. Instead of that,' +
    '\r\n' +
    'now you can use replayer.getMirror() to access the mirror instance of a replayer,' +
    '\r\n' +
    'or you can use record.mirror to access the mirror instance during recording.';
export let _mirror = {
    map: {},
    getId() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return -1;
    },
    getNode() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return null;
    },
    removeNodeFromMap() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return false;
    },
    reset() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
};
if (typeof window !== 'undefined' && window.Proxy && window.Reflect) {
    _mirror = new Proxy(_mirror, {
        get(target, prop, receiver) {
            if (prop === 'map') {
                console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
export function throttle(func, wait, options = {}) {
    let timeout = null;
    let previous = 0;
    return function (...args) {
        const now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        const remaining = wait - (now - previous);
        const context = this;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(() => {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
export function hookSetter(target, key, d, isRevoked, win = window) {
    const original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(
        target,
        key,
        isRevoked
            ? d
            : {
                  set(value) {
                      setTimeout(() => {
                          d.set.call(this, value);
                      }, 0);
                      if (original && original.set) {
                          original.set.call(this, value);
                      }
                  },
              }
    );
    return () => hookSetter(target, key, original || {}, true);
}
export function patch(source, name, replacement) {
    try {
        if (!(name in source)) {
            return () => {};
        }
        const original = source[name];
        const wrapped = replacement(original);
        if (typeof wrapped === 'function') {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __rrweb_original__: {
                    enumerable: false,
                    value: original,
                },
            });
        }
        source[name] = wrapped;
        return () => {
            source[name] = original;
        };
    } catch (_a) {
        return () => {};
    }
}
let nowTimestamp = Date.now;
if (!/[1-9][0-9]{12}/.test(Date.now().toString())) {
    nowTimestamp = () => new Date().getTime();
}
export { nowTimestamp };
export function getWindowScroll(win) {
    var _a, _b, _c, _d, _e, _f;
    const doc = win.document;
    return {
        left: doc.scrollingElement
            ? doc.scrollingElement.scrollLeft
            : win.pageXOffset !== undefined
              ? win.pageXOffset
              : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollLeft) ||
                ((_b =
                    (_a = doc === null || doc === void 0 ? void 0 : doc.body) === null || _a === void 0
                        ? void 0
                        : _a.parentElement) === null || _b === void 0
                    ? void 0
                    : _b.scrollLeft) ||
                ((_c = doc === null || doc === void 0 ? void 0 : doc.body) === null || _c === void 0
                    ? void 0
                    : _c.scrollLeft) ||
                0,
        top: doc.scrollingElement
            ? doc.scrollingElement.scrollTop
            : win.pageYOffset !== undefined
              ? win.pageYOffset
              : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollTop) ||
                ((_e =
                    (_d = doc === null || doc === void 0 ? void 0 : doc.body) === null || _d === void 0
                        ? void 0
                        : _d.parentElement) === null || _e === void 0
                    ? void 0
                    : _e.scrollTop) ||
                ((_f = doc === null || doc === void 0 ? void 0 : doc.body) === null || _f === void 0
                    ? void 0
                    : _f.scrollTop) ||
                0,
    };
}
export function getWindowHeight() {
    return (
        window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.body && document.body.clientHeight)
    );
}
export function getWindowWidth() {
    return (
        window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        (document.body && document.body.clientWidth)
    );
}
export function closestElementOfNode(node) {
    if (!node) {
        return null;
    }
    const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
    return el;
}
export function isBlocked(node, blockClass, blockSelector, checkAncestors) {
    if (!node) {
        return false;
    }
    const el = closestElementOfNode(node);
    if (!el) {
        return false;
    }
    try {
        if (typeof blockClass === 'string') {
            if (el.classList.contains(blockClass)) return true;
            if (checkAncestors && el.closest('.' + blockClass) !== null) return true;
        } else {
            if (classMatchesRegex(el, blockClass, checkAncestors)) return true;
        }
    } catch (e) {}
    if (blockSelector) {
        if (el.matches(blockSelector)) return true;
        if (checkAncestors && el.closest(blockSelector) !== null) return true;
    }
    return false;
}
export function isSerialized(n, mirror) {
    return mirror.getId(n) !== -1;
}
export function isIgnored(n, mirror) {
    return mirror.getId(n) === IGNORED_NODE;
}
export function isAncestorRemoved(target, mirror) {
    if (isShadowRoot(target)) {
        return false;
    }
    const id = mirror.getId(target);
    if (!mirror.has(id)) {
        return true;
    }
    if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) {
        return false;
    }
    if (!target.parentNode) {
        return true;
    }
    return isAncestorRemoved(target.parentNode, mirror);
}
export function legacy_isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
export function polyfill(win = window) {
    if ('NodeList' in win && !win.NodeList.prototype.forEach) {
        win.NodeList.prototype.forEach = Array.prototype.forEach;
    }
    if ('DOMTokenList' in win && !win.DOMTokenList.prototype.forEach) {
        win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
    }
    if (!Node.prototype.contains) {
        Node.prototype.contains = (...args) => {
            let node = args[0];
            if (!(0 in args)) {
                throw new TypeError('1 argument is required');
            }
            do {
                if (this === node) {
                    return true;
                }
            } while ((node = node && node.parentNode));
            return false;
        };
    }
}
export function queueToResolveTrees(queue) {
    const queueNodeMap = {};
    const putIntoMap = (m, parent) => {
        const nodeInTree = {
            value: m,
            parent,
            children: [],
        };
        queueNodeMap[m.node.id] = nodeInTree;
        return nodeInTree;
    };
    const queueNodeTrees = [];
    for (const mutation of queue) {
        const { nextId, parentId } = mutation;
        if (nextId && nextId in queueNodeMap) {
            const nextInTree = queueNodeMap[nextId];
            if (nextInTree.parent) {
                const idx = nextInTree.parent.children.indexOf(nextInTree);
                nextInTree.parent.children.splice(idx, 0, putIntoMap(mutation, nextInTree.parent));
            } else {
                const idx = queueNodeTrees.indexOf(nextInTree);
                queueNodeTrees.splice(idx, 0, putIntoMap(mutation, null));
            }
            continue;
        }
        if (parentId in queueNodeMap) {
            const parentInTree = queueNodeMap[parentId];
            parentInTree.children.push(putIntoMap(mutation, parentInTree));
            continue;
        }
        queueNodeTrees.push(putIntoMap(mutation, null));
    }
    return queueNodeTrees;
}
export function iterateResolveTree(tree, cb) {
    cb(tree.value);
    for (let i = tree.children.length - 1; i >= 0; i--) {
        iterateResolveTree(tree.children[i], cb);
    }
}
export function isSerializedIframe(n, mirror) {
    return Boolean(n.nodeName === 'IFRAME' && mirror.getMeta(n));
}
export function isSerializedStylesheet(n, mirror) {
    return Boolean(
        n.nodeName === 'LINK' &&
            n.nodeType === n.ELEMENT_NODE &&
            n.getAttribute &&
            n.getAttribute('rel') === 'stylesheet' &&
            mirror.getMeta(n)
    );
}
export function getBaseDimension(node, rootIframe) {
    var _a, _b;
    const frameElement =
        (_b = (_a = node.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0
            ? void 0
            : _b.frameElement;
    if (!frameElement || frameElement === rootIframe) {
        return {
            x: 0,
            y: 0,
            relativeScale: 1,
            absoluteScale: 1,
        };
    }
    const frameDimension = frameElement.getBoundingClientRect();
    const frameBaseDimension = getBaseDimension(frameElement, rootIframe);
    const relativeScale = frameDimension.height / frameElement.clientHeight;
    return {
        x: frameDimension.x * frameBaseDimension.relativeScale + frameBaseDimension.x,
        y: frameDimension.y * frameBaseDimension.relativeScale + frameBaseDimension.y,
        relativeScale,
        absoluteScale: frameBaseDimension.absoluteScale * relativeScale,
    };
}
export function hasShadowRoot(n) {
    return Boolean(n === null || n === void 0 ? void 0 : n.shadowRoot);
}
export function getNestedRule(rules, position) {
    const rule = rules[position[0]];
    if (position.length === 1) {
        return rule;
    } else {
        return getNestedRule(rule.cssRules[position[1]].cssRules, position.slice(2));
    }
}
export function getPositionsAndIndex(nestedIndex) {
    const positions = [...nestedIndex];
    const index = positions.pop();
    return { positions, index };
}
export function uniqueTextMutations(mutations) {
    const idSet = new Set();
    const uniqueMutations = [];
    for (let i = mutations.length; i--; ) {
        const mutation = mutations[i];
        if (!idSet.has(mutation.id)) {
            uniqueMutations.push(mutation);
            idSet.add(mutation.id);
        }
    }
    return uniqueMutations;
}
export class StyleSheetMirror {
    constructor() {
        this.id = 1;
        this.styleIDMap = new WeakMap();
        this.idStyleMap = new Map();
    }
    getId(stylesheet) {
        var _a;
        return (_a = this.styleIDMap.get(stylesheet)) !== null && _a !== void 0 ? _a : -1;
    }
    has(stylesheet) {
        return this.styleIDMap.has(stylesheet);
    }
    add(stylesheet, id) {
        if (this.has(stylesheet)) return this.getId(stylesheet);
        let newId;
        if (id === undefined) {
            newId = this.id++;
        } else newId = id;
        this.styleIDMap.set(stylesheet, newId);
        this.idStyleMap.set(newId, stylesheet);
        return newId;
    }
    getStyle(id) {
        return this.idStyleMap.get(id) || null;
    }
    reset() {
        this.styleIDMap = new WeakMap();
        this.idStyleMap = new Map();
        this.id = 1;
    }
    generateId() {
        return this.id++;
    }
}
export function getShadowHost(n) {
    var _a, _b;
    let shadowHost = null;
    if (
        ((_b = (_a = n.getRootNode) === null || _a === void 0 ? void 0 : _a.call(n)) === null || _b === void 0
            ? void 0
            : _b.nodeType) === Node.DOCUMENT_FRAGMENT_NODE &&
        n.getRootNode().host
    )
        shadowHost = n.getRootNode().host;
    return shadowHost;
}
export function getRootShadowHost(n) {
    let rootShadowHost = n;
    let shadowHost;
    while ((shadowHost = getShadowHost(rootShadowHost))) rootShadowHost = shadowHost;
    return rootShadowHost;
}
export function shadowHostInDom(n) {
    const doc = n.ownerDocument;
    if (!doc) return false;
    const shadowHost = getRootShadowHost(n);
    return doc.contains(shadowHost);
}
export function inDom(n) {
    const doc = n.ownerDocument;
    if (!doc) return false;
    return doc.contains(n) || shadowHostInDom(n);
}
