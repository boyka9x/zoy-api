import { maskInputValue, getInputType, toLowerCase, } from '../rrweb-snapshot';
import { throttle, on, hookSetter, getWindowScroll, getWindowHeight, getWindowWidth, isBlocked, legacy_isTouchEvent, patch, nowTimestamp, } from '../utils';
import { MouseInteractions, PointerTypes, IncrementalSource, } from '@rrweb/types';
import MutationBuffer from './mutation';
import { callbackWrapper } from './error-handler';
export const mutationBuffers = [];
function getEventTarget(event) {
    try {
        if ('composedPath' in event) {
            const path = event.composedPath();
            if (path.length) {
                return path[0];
            }
        }
        else if ('path' in event && event.path.length) {
            return event.path[0];
        }
    }
    catch (_a) {
    }
    return event && event.target;
}
export function initMutationObserver(options, rootEl) {
    var _a, _b;
    const mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(options);
    let mutationObserverCtor = window.MutationObserver ||
        window.__rrMutationObserver;
    const angularZoneSymbol = (_b = (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0 ? void 0 : _a.__symbol__) === null || _b === void 0 ? void 0 : _b.call(_a, 'MutationObserver');
    if (angularZoneSymbol &&
        window[angularZoneSymbol]) {
        mutationObserverCtor = window[angularZoneSymbol];
    }
    const observer = new mutationObserverCtor(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
    observer.observe(rootEl, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    });
    return observer;
}
function initMoveObserver({ mousemoveCb, sampling, doc, mirror, }) {
    if (sampling.mousemove === false) {
        return () => {
        };
    }
    const threshold = typeof sampling.mousemove === 'number' ? sampling.mousemove : 50;
    const callbackThreshold = typeof sampling.mousemoveCallback === 'number'
        ? sampling.mousemoveCallback
        : 500;
    let positions = [];
    let timeBaseline;
    const wrappedCb = throttle(callbackWrapper((source) => {
        const totalOffset = Date.now() - timeBaseline;
        mousemoveCb(positions.map((p) => {
            p.timeOffset -= totalOffset;
            return p;
        }), source);
        positions = [];
        timeBaseline = null;
    }), callbackThreshold);
    const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
        const target = getEventTarget(evt);
        const { clientX, clientY } = legacy_isTouchEvent(evt)
            ? evt.changedTouches[0]
            : evt;
        if (!timeBaseline) {
            timeBaseline = nowTimestamp();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: mirror.getId(target),
            timeOffset: nowTimestamp() - timeBaseline,
        });
        wrappedCb(typeof DragEvent !== 'undefined' && evt instanceof DragEvent
            ? IncrementalSource.Drag
            : evt instanceof MouseEvent
                ? IncrementalSource.MouseMove
                : IncrementalSource.TouchMove);
    }), threshold, {
        trailing: false,
    }));
    const handlers = [
        on('mousemove', updatePosition, doc),
        on('touchmove', updatePosition, doc),
        on('drag', updatePosition, doc),
    ];
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror, blockClass, blockSelector, sampling, }) {
    if (sampling.mouseInteraction === false) {
        return () => {
        };
    }
    const disableMap = sampling.mouseInteraction === true ||
        sampling.mouseInteraction === undefined
        ? {}
        : sampling.mouseInteraction;
    const handlers = [];
    let currentPointerType = null;
    const getHandler = (eventKey) => {
        return (event) => {
            const target = getEventTarget(event);
            if (isBlocked(target, blockClass, blockSelector, true)) {
                return;
            }
            let pointerType = null;
            let thisEventKey = eventKey;
            if ('pointerType' in event) {
                switch (event.pointerType) {
                    case 'mouse':
                        pointerType = PointerTypes.Mouse;
                        break;
                    case 'touch':
                        pointerType = PointerTypes.Touch;
                        break;
                    case 'pen':
                        pointerType = PointerTypes.Pen;
                        break;
                }
                if (pointerType === PointerTypes.Touch) {
                    if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
                        thisEventKey = 'TouchStart';
                    }
                    else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
                        thisEventKey = 'TouchEnd';
                    }
                }
                else if (pointerType === PointerTypes.Pen) {
                }
            }
            else if (legacy_isTouchEvent(event)) {
                pointerType = PointerTypes.Touch;
            }
            if (pointerType !== null) {
                currentPointerType = pointerType;
                if ((thisEventKey.startsWith('Touch') &&
                    pointerType === PointerTypes.Touch) ||
                    (thisEventKey.startsWith('Mouse') &&
                        pointerType === PointerTypes.Mouse)) {
                    pointerType = null;
                }
            }
            else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
                pointerType = currentPointerType;
                currentPointerType = null;
            }
            const e = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
            if (!e) {
                return;
            }
            const id = mirror.getId(target);
            const { clientX, clientY } = e;
            callbackWrapper(mouseInteractionCb)(Object.assign({ type: MouseInteractions[thisEventKey], id, x: clientX, y: clientY }, (pointerType !== null && { pointerType })));
        };
    };
    Object.keys(MouseInteractions)
        .filter((key) => Number.isNaN(Number(key)) &&
        !key.endsWith('_Departed') &&
        disableMap[key] !== false)
        .forEach((eventKey) => {
        let eventName = toLowerCase(eventKey);
        const handler = getHandler(eventKey);
        if (window.PointerEvent) {
            switch (MouseInteractions[eventKey]) {
                case MouseInteractions.MouseDown:
                case MouseInteractions.MouseUp:
                    eventName = eventName.replace('mouse', 'pointer');
                    break;
                case MouseInteractions.TouchStart:
                case MouseInteractions.TouchEnd:
                    return;
            }
        }
        handlers.push(on(eventName, handler, doc));
    });
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
export function initScrollObserver({ scrollCb, doc, mirror, blockClass, blockSelector, sampling, }) {
    const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
        const target = getEventTarget(evt);
        if (!target ||
            isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        const id = mirror.getId(target);
        if (target === doc && doc.defaultView) {
            const scrollLeftTop = getWindowScroll(doc.defaultView);
            scrollCb({
                id,
                x: scrollLeftTop.left,
                y: scrollLeftTop.top,
            });
        }
        else {
            scrollCb({
                id,
                x: target.scrollLeft,
                y: target.scrollTop,
            });
        }
    }), sampling.scroll || 100));
    return on('scroll', updatePosition, doc);
}
function initViewportResizeObserver({ viewportResizeCb }, { win }) {
    let lastH = -1;
    let lastW = -1;
    const updateDimension = callbackWrapper(throttle(callbackWrapper(() => {
        const height = getWindowHeight();
        const width = getWindowWidth();
        if (lastH !== height || lastW !== width) {
            viewportResizeCb({
                width: Number(width),
                height: Number(height),
            });
            lastH = height;
            lastW = width;
        }
    }), 200));
    return on('resize', updateDimension, win);
}
export const INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
const lastInputValueMap = new WeakMap();
function initInputObserver({ inputCb, doc, mirror, blockClass, blockSelector, ignoreClass, ignoreSelector, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput, }) {
    function eventHandler(event) {
        let target = getEventTarget(event);
        const userTriggered = event.isTrusted;
        const tagName = target && target.tagName;
        if (target && tagName === 'OPTION') {
            target = target.parentElement;
        }
        if (!target ||
            !tagName ||
            INPUT_TAGS.indexOf(tagName) < 0 ||
            isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        if (target.classList.contains(ignoreClass) ||
            (ignoreSelector && target.matches(ignoreSelector))) {
            return;
        }
        let text = target.value;
        let isChecked = false;
        const type = getInputType(target) || '';
        if (type === 'radio' || type === 'checkbox') {
            isChecked = target.checked;
        }
        else if (maskInputOptions[tagName.toLowerCase()] ||
            maskInputOptions[type]) {
            text = maskInputValue({
                element: target,
                maskInputOptions,
                tagName,
                type,
                value: text,
                maskInputFn,
            });
        }
        cbWithDedup(target, userTriggeredOnInput
            ? { text, isChecked, userTriggered }
            : { text, isChecked });
        const name = target.name;
        if (type === 'radio' && name && isChecked) {
            doc
                .querySelectorAll(`input[type="radio"][name="${name}"]`)
                .forEach((el) => {
                if (el !== target) {
                    const text = el.value;
                    cbWithDedup(el, userTriggeredOnInput
                        ? { text, isChecked: !isChecked, userTriggered: false }
                        : { text, isChecked: !isChecked });
                }
            });
        }
    }
    function cbWithDedup(target, v) {
        const lastInputValue = lastInputValueMap.get(target);
        if (!lastInputValue ||
            lastInputValue.text !== v.text ||
            lastInputValue.isChecked !== v.isChecked) {
            lastInputValueMap.set(target, v);
            const id = mirror.getId(target);
            callbackWrapper(inputCb)(Object.assign(Object.assign({}, v), { id }));
        }
    }
    const events = sampling.input === 'last' ? ['change'] : ['input', 'change'];
    const handlers = events.map((eventName) => on(eventName, callbackWrapper(eventHandler), doc));
    const currentWindow = doc.defaultView;
    if (!currentWindow) {
        return () => {
            handlers.forEach((h) => h());
        };
    }
    const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, 'value');
    const hookProperties = [
        [currentWindow.HTMLInputElement.prototype, 'value'],
        [currentWindow.HTMLInputElement.prototype, 'checked'],
        [currentWindow.HTMLSelectElement.prototype, 'value'],
        [currentWindow.HTMLTextAreaElement.prototype, 'value'],
        [currentWindow.HTMLSelectElement.prototype, 'selectedIndex'],
        [currentWindow.HTMLOptionElement.prototype, 'selected'],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        handlers.push(...hookProperties.map((p) => hookSetter(p[0], p[1], {
            set() {
                callbackWrapper(eventHandler)({
                    target: this,
                    isTrusted: false,
                });
            },
        }, false, currentWindow)));
    }
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function getNestedCSSRulePositions(rule) {
    const positions = [];
    function recurse(childRule, pos) {
        if ((hasNestedCSSRule('CSSGroupingRule') &&
            childRule.parentRule instanceof CSSGroupingRule) ||
            (hasNestedCSSRule('CSSMediaRule') &&
                childRule.parentRule instanceof CSSMediaRule) ||
            (hasNestedCSSRule('CSSSupportsRule') &&
                childRule.parentRule instanceof CSSSupportsRule) ||
            (hasNestedCSSRule('CSSConditionRule') &&
                childRule.parentRule instanceof CSSConditionRule)) {
            const rules = Array.from(childRule.parentRule.cssRules);
            const index = rules.indexOf(childRule);
            pos.unshift(index);
        }
        else if (childRule.parentStyleSheet) {
            const rules = Array.from(childRule.parentStyleSheet.cssRules);
            const index = rules.indexOf(childRule);
            pos.unshift(index);
        }
        return pos;
    }
    return recurse(rule, positions);
}
function getIdAndStyleId(sheet, mirror, styleMirror) {
    let id, styleId;
    if (!sheet)
        return {};
    if (sheet.ownerNode)
        id = mirror.getId(sheet.ownerNode);
    else
        styleId = styleMirror.getId(sheet);
    return {
        styleId,
        id,
    };
}
function initStyleSheetObserver({ styleSheetRuleCb, mirror, stylesheetManager }, { win }) {
    if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
        return () => {
        };
    }
    const insertRule = win.CSSStyleSheet.prototype.insertRule;
    win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            const [rule, index] = argumentsList;
            const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleSheetRuleCb({
                    id,
                    styleId,
                    adds: [{ rule, index }],
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
    win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            const [index] = argumentsList;
            const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleSheetRuleCb({
                    id,
                    styleId,
                    removes: [{ index }],
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    let replace;
    if (win.CSSStyleSheet.prototype.replace) {
        replace = win.CSSStyleSheet.prototype.replace;
        win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [text] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        replace: text,
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
    }
    let replaceSync;
    if (win.CSSStyleSheet.prototype.replaceSync) {
        replaceSync = win.CSSStyleSheet.prototype.replaceSync;
        win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [text] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        replaceSync: text,
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
    }
    const supportedNestedCSSRuleTypes = {};
    if (canMonkeyPatchNestedCSSRule('CSSGroupingRule')) {
        supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
    }
    else {
        if (canMonkeyPatchNestedCSSRule('CSSMediaRule')) {
            supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
        }
        if (canMonkeyPatchNestedCSSRule('CSSConditionRule')) {
            supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
        }
        if (canMonkeyPatchNestedCSSRule('CSSSupportsRule')) {
            supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
        }
    }
    const unmodifiedFunctions = {};
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
        unmodifiedFunctions[typeKey] = {
            insertRule: type.prototype.insertRule,
            deleteRule: type.prototype.deleteRule,
        };
        type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [rule, index] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        adds: [
                            {
                                rule,
                                index: [
                                    ...getNestedCSSRulePositions(thisArg),
                                    index || 0,
                                ],
                            },
                        ],
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
        type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [index] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        removes: [
                            { index: [...getNestedCSSRulePositions(thisArg), index] },
                        ],
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
    });
    return callbackWrapper(() => {
        win.CSSStyleSheet.prototype.insertRule = insertRule;
        win.CSSStyleSheet.prototype.deleteRule = deleteRule;
        replace && (win.CSSStyleSheet.prototype.replace = replace);
        replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
        Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
            type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
            type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
        });
    });
}
export function initAdoptedStyleSheetObserver({ mirror, stylesheetManager, }, host) {
    var _a, _b, _c;
    let hostId = null;
    if (host.nodeName === '#document')
        hostId = mirror.getId(host);
    else
        hostId = mirror.getId(host.host);
    const patchTarget = host.nodeName === '#document'
        ? (_a = host.defaultView) === null || _a === void 0 ? void 0 : _a.Document
        : (_c = (_b = host.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView) === null || _c === void 0 ? void 0 : _c.ShadowRoot;
    const originalPropertyDescriptor = (patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype)
        ? Object.getOwnPropertyDescriptor(patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype, 'adoptedStyleSheets')
        : undefined;
    if (hostId === null ||
        hostId === -1 ||
        !patchTarget ||
        !originalPropertyDescriptor)
        return () => {
        };
    Object.defineProperty(host, 'adoptedStyleSheets', {
        configurable: originalPropertyDescriptor.configurable,
        enumerable: originalPropertyDescriptor.enumerable,
        get() {
            var _a;
            return (_a = originalPropertyDescriptor.get) === null || _a === void 0 ? void 0 : _a.call(this);
        },
        set(sheets) {
            var _a;
            const result = (_a = originalPropertyDescriptor.set) === null || _a === void 0 ? void 0 : _a.call(this, sheets);
            if (hostId !== null && hostId !== -1) {
                try {
                    stylesheetManager.adoptStyleSheets(sheets, hostId);
                }
                catch (e) {
                }
            }
            return result;
        },
    });
    return callbackWrapper(() => {
        Object.defineProperty(host, 'adoptedStyleSheets', {
            configurable: originalPropertyDescriptor.configurable,
            enumerable: originalPropertyDescriptor.enumerable,
            get: originalPropertyDescriptor.get,
            set: originalPropertyDescriptor.set,
        });
    });
}
function initStyleDeclarationObserver({ styleDeclarationCb, mirror, ignoreCSSAttributes, stylesheetManager, }, { win }) {
    const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
    win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            var _a;
            const [property, value, priority] = argumentsList;
            if (ignoreCSSAttributes.has(property)) {
                return setProperty.apply(thisArg, [property, value, priority]);
            }
            const { id, styleId } = getIdAndStyleId((_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleDeclarationCb({
                    id,
                    styleId,
                    set: {
                        property,
                        value,
                        priority,
                    },
                    index: getNestedCSSRulePositions(thisArg.parentRule),
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            var _a;
            const [property] = argumentsList;
            if (ignoreCSSAttributes.has(property)) {
                return removeProperty.apply(thisArg, [property]);
            }
            const { id, styleId } = getIdAndStyleId((_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleDeclarationCb({
                    id,
                    styleId,
                    remove: {
                        property,
                    },
                    index: getNestedCSSRulePositions(thisArg.parentRule),
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    return callbackWrapper(() => {
        win.CSSStyleDeclaration.prototype.setProperty = setProperty;
        win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
    });
}
function initMediaInteractionObserver({ mediaInteractionCb, blockClass, blockSelector, mirror, sampling, doc, }) {
    const handler = callbackWrapper((type) => throttle(callbackWrapper((event) => {
        const target = getEventTarget(event);
        if (!target ||
            isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        const { currentTime, volume, muted, playbackRate } = target;
        mediaInteractionCb({
            type,
            id: mirror.getId(target),
            currentTime,
            volume,
            muted,
            playbackRate,
        });
    }), sampling.media || 500));
    const handlers = [
        on('play', handler(0), doc),
        on('pause', handler(1), doc),
        on('seeked', handler(2), doc),
        on('volumechange', handler(3), doc),
        on('ratechange', handler(4), doc),
    ];
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initFontObserver({ fontCb, doc }) {
    const win = doc.defaultView;
    if (!win) {
        return () => {
        };
    }
    const handlers = [];
    const fontMap = new WeakMap();
    const originalFontFace = win.FontFace;
    win.FontFace = function FontFace(family, source, descriptors) {
        const fontFace = new originalFontFace(family, source, descriptors);
        fontMap.set(fontFace, {
            family,
            buffer: typeof source !== 'string',
            descriptors,
            fontSource: typeof source === 'string'
                ? source
                : JSON.stringify(Array.from(new Uint8Array(source))),
        });
        return fontFace;
    };
    const restoreHandler = patch(doc.fonts, 'add', function (original) {
        return function (fontFace) {
            setTimeout(callbackWrapper(() => {
                const p = fontMap.get(fontFace);
                if (p) {
                    fontCb(p);
                    fontMap.delete(fontFace);
                }
            }), 0);
            return original.apply(this, [fontFace]);
        };
    });
    handlers.push(() => {
        win.FontFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initSelectionObserver(param) {
    const { doc, mirror, blockClass, blockSelector, selectionCb } = param;
    let collapsed = true;
    const updateSelection = callbackWrapper(() => {
        const selection = doc.getSelection();
        if (!selection || (collapsed && (selection === null || selection === void 0 ? void 0 : selection.isCollapsed)))
            return;
        collapsed = selection.isCollapsed || false;
        const ranges = [];
        const count = selection.rangeCount || 0;
        for (let i = 0; i < count; i++) {
            const range = selection.getRangeAt(i);
            const { startContainer, startOffset, endContainer, endOffset } = range;
            const blocked = isBlocked(startContainer, blockClass, blockSelector, true) ||
                isBlocked(endContainer, blockClass, blockSelector, true);
            if (blocked)
                continue;
            ranges.push({
                start: mirror.getId(startContainer),
                startOffset,
                end: mirror.getId(endContainer),
                endOffset,
            });
        }
        selectionCb({ ranges });
    });
    updateSelection();
    return on('selectionchange', updateSelection);
}
function initCustomElementObserver({ doc, customElementCb, }) {
    const win = doc.defaultView;
    if (!win || !win.customElements)
        return () => { };
    const restoreHandler = patch(win.customElements, 'define', function (original) {
        return function (name, constructor, options) {
            try {
                customElementCb({
                    define: {
                        name,
                    },
                });
            }
            catch (e) {
                console.warn(`Custom element callback failed for ${name}`);
            }
            return original.apply(this, [name, constructor, options]);
        };
    });
    return restoreHandler;
}
function mergeHooks(o, hooks) {
    const { mutationCb, mousemoveCb, mouseInteractionCb, scrollCb, viewportResizeCb, inputCb, mediaInteractionCb, styleSheetRuleCb, styleDeclarationCb, canvasMutationCb, fontCb, selectionCb, customElementCb, } = o;
    o.mutationCb = (...p) => {
        if (hooks.mutation) {
            hooks.mutation(...p);
        }
        mutationCb(...p);
    };
    o.mousemoveCb = (...p) => {
        if (hooks.mousemove) {
            hooks.mousemove(...p);
        }
        mousemoveCb(...p);
    };
    o.mouseInteractionCb = (...p) => {
        if (hooks.mouseInteraction) {
            hooks.mouseInteraction(...p);
        }
        mouseInteractionCb(...p);
    };
    o.scrollCb = (...p) => {
        if (hooks.scroll) {
            hooks.scroll(...p);
        }
        scrollCb(...p);
    };
    o.viewportResizeCb = (...p) => {
        if (hooks.viewportResize) {
            hooks.viewportResize(...p);
        }
        viewportResizeCb(...p);
    };
    o.inputCb = (...p) => {
        if (hooks.input) {
            hooks.input(...p);
        }
        inputCb(...p);
    };
    o.mediaInteractionCb = (...p) => {
        if (hooks.mediaInteaction) {
            hooks.mediaInteaction(...p);
        }
        mediaInteractionCb(...p);
    };
    o.styleSheetRuleCb = (...p) => {
        if (hooks.styleSheetRule) {
            hooks.styleSheetRule(...p);
        }
        styleSheetRuleCb(...p);
    };
    o.styleDeclarationCb = (...p) => {
        if (hooks.styleDeclaration) {
            hooks.styleDeclaration(...p);
        }
        styleDeclarationCb(...p);
    };
    o.canvasMutationCb = (...p) => {
        if (hooks.canvasMutation) {
            hooks.canvasMutation(...p);
        }
        canvasMutationCb(...p);
    };
    o.fontCb = (...p) => {
        if (hooks.font) {
            hooks.font(...p);
        }
        fontCb(...p);
    };
    o.selectionCb = (...p) => {
        if (hooks.selection) {
            hooks.selection(...p);
        }
        selectionCb(...p);
    };
    o.customElementCb = (...c) => {
        if (hooks.customElement) {
            hooks.customElement(...c);
        }
        customElementCb(...c);
    };
}
export function initObservers(o, hooks = {}) {
    const currentWindow = o.doc.defaultView;
    if (!currentWindow) {
        return () => {
        };
    }
    mergeHooks(o, hooks);
    let mutationObserver;
    if (o.recordDOM) {
        mutationObserver = initMutationObserver(o, o.doc);
    }
    const mousemoveHandler = initMoveObserver(o);
    const mouseInteractionHandler = initMouseInteractionObserver(o);
    const scrollHandler = initScrollObserver(o);
    const viewportResizeHandler = initViewportResizeObserver(o, {
        win: currentWindow,
    });
    const inputHandler = initInputObserver(o);
    const mediaInteractionHandler = initMediaInteractionObserver(o);
    let styleSheetObserver = () => { };
    let adoptedStyleSheetObserver = () => { };
    let styleDeclarationObserver = () => { };
    let fontObserver = () => { };
    if (o.recordDOM) {
        styleSheetObserver = initStyleSheetObserver(o, { win: currentWindow });
        adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o, o.doc);
        styleDeclarationObserver = initStyleDeclarationObserver(o, {
            win: currentWindow,
        });
        if (o.collectFonts) {
            fontObserver = initFontObserver(o);
        }
    }
    const selectionObserver = initSelectionObserver(o);
    const customElementObserver = initCustomElementObserver(o);
    const pluginHandlers = [];
    for (const plugin of o.plugins) {
        pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
    }
    return callbackWrapper(() => {
        mutationBuffers.forEach((b) => b.reset());
        mutationObserver === null || mutationObserver === void 0 ? void 0 : mutationObserver.disconnect();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
        mediaInteractionHandler();
        styleSheetObserver();
        adoptedStyleSheetObserver();
        styleDeclarationObserver();
        fontObserver();
        selectionObserver();
        customElementObserver();
        pluginHandlers.forEach((h) => h());
    });
}
function hasNestedCSSRule(prop) {
    return typeof window[prop] !== 'undefined';
}
function canMonkeyPatchNestedCSSRule(prop) {
    return Boolean(typeof window[prop] !== 'undefined' &&
        window[prop].prototype &&
        'insertRule' in window[prop].prototype &&
        'deleteRule' in window[prop].prototype);
}
