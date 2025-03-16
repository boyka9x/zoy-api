import { parse } from './css';
import { NodeType, } from './types';
import { isElement, Mirror, isNodeMetaEqual } from './utils';
const tagMap = {
    script: 'noscript',
    altglyph: 'altGlyph',
    altglyphdef: 'altGlyphDef',
    altglyphitem: 'altGlyphItem',
    animatecolor: 'animateColor',
    animatemotion: 'animateMotion',
    animatetransform: 'animateTransform',
    clippath: 'clipPath',
    feblend: 'feBlend',
    fecolormatrix: 'feColorMatrix',
    fecomponenttransfer: 'feComponentTransfer',
    fecomposite: 'feComposite',
    feconvolvematrix: 'feConvolveMatrix',
    fediffuselighting: 'feDiffuseLighting',
    fedisplacementmap: 'feDisplacementMap',
    fedistantlight: 'feDistantLight',
    fedropshadow: 'feDropShadow',
    feflood: 'feFlood',
    fefunca: 'feFuncA',
    fefuncb: 'feFuncB',
    fefuncg: 'feFuncG',
    fefuncr: 'feFuncR',
    fegaussianblur: 'feGaussianBlur',
    feimage: 'feImage',
    femerge: 'feMerge',
    femergenode: 'feMergeNode',
    femorphology: 'feMorphology',
    feoffset: 'feOffset',
    fepointlight: 'fePointLight',
    fespecularlighting: 'feSpecularLighting',
    fespotlight: 'feSpotLight',
    fetile: 'feTile',
    feturbulence: 'feTurbulence',
    foreignobject: 'foreignObject',
    glyphref: 'glyphRef',
    lineargradient: 'linearGradient',
    radialgradient: 'radialGradient',
};
function getTagName(n) {
    let tagName = tagMap[n.tagName] ? tagMap[n.tagName] : n.tagName;
    if (tagName === 'link' && n.attributes._cssText) {
        tagName = 'style';
    }
    return tagName;
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const HOVER_SELECTOR = /([^\\]):hover/;
const HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, 'g');
export function addHoverClass(cssText, cache) {
    const cachedStyle = cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.get(cssText);
    if (cachedStyle)
        return cachedStyle;
    const ast = parse(cssText, {
        silent: true,
    });
    if (!ast.stylesheet) {
        return cssText;
    }
    const selectors = [];
    ast.stylesheet.rules.forEach((rule) => {
        if ('selectors' in rule) {
            (rule.selectors || []).forEach((selector) => {
                if (HOVER_SELECTOR.test(selector)) {
                    selectors.push(selector);
                }
            });
        }
    });
    if (selectors.length === 0) {
        return cssText;
    }
    const selectorMatcher = new RegExp(selectors
        .filter((selector, index) => selectors.indexOf(selector) === index)
        .sort((a, b) => b.length - a.length)
        .map((selector) => {
        return escapeRegExp(selector);
    })
        .join('|'), 'g');
    const result = cssText.replace(selectorMatcher, (selector) => {
        const newSelector = selector.replace(HOVER_SELECTOR_GLOBAL, '$1.\\:hover');
        return `${selector}, ${newSelector}`;
    });
    cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.set(cssText, result);
    return result;
}
export function createCache() {
    const stylesWithHoverClass = new Map();
    return {
        stylesWithHoverClass,
    };
}
function buildNode(n, options) {
    var _a;
    const { doc, hackCss, cache } = options;
    switch (n.type) {
        case NodeType.Document:
            return doc.implementation.createDocument(null, '', null);
        case NodeType.DocumentType:
            return doc.implementation.createDocumentType(n.name || 'html', n.publicId, n.systemId);
        case NodeType.Element: {
            const tagName = getTagName(n);
            let node;
            if (n.isSVG) {
                node = doc.createElementNS('http://www.w3.org/2000/svg', tagName);
            }
            else {
                if (n.isCustom &&
                    ((_a = doc.defaultView) === null || _a === void 0 ? void 0 : _a.customElements) &&
                    !doc.defaultView.customElements.get(n.tagName))
                    doc.defaultView.customElements.define(n.tagName, class extends doc.defaultView.HTMLElement {
                    });
                node = doc.createElement(tagName);
            }
            const specialAttributes = {};
            for (const name in n.attributes) {
                if (!Object.prototype.hasOwnProperty.call(n.attributes, name)) {
                    continue;
                }
                let value = n.attributes[name];
                if (tagName === 'option' &&
                    name === 'selected' &&
                    value === false) {
                    continue;
                }
                if (value === null) {
                    continue;
                }
                if (value === true)
                    value = '';
                if (name.startsWith('rr_')) {
                    specialAttributes[name] = value;
                    continue;
                }
                const isTextarea = tagName === 'textarea' && name === 'value';
                const isRemoteOrDynamicCss = tagName === 'style' && name === '_cssText';
                if (isRemoteOrDynamicCss && hackCss && typeof value === 'string') {
                    value = addHoverClass(value, cache);
                }
                if ((isTextarea || isRemoteOrDynamicCss) && typeof value === 'string') {
                    node.appendChild(doc.createTextNode(value));
                    n.childNodes = [];
                    continue;
                }
                try {
                    if (n.isSVG && name === 'xlink:href') {
                        node.setAttributeNS('http://www.w3.org/1999/xlink', name, value.toString());
                    }
                    else if (name === 'onload' ||
                        name === 'onclick' ||
                        name.substring(0, 7) === 'onmouse') {
                        node.setAttribute('_' + name, value.toString());
                    }
                    else if (tagName === 'meta' &&
                        n.attributes['http-equiv'] === 'Content-Security-Policy' &&
                        name === 'content') {
                        node.setAttribute('csp-content', value.toString());
                        continue;
                    }
                    else if (tagName === 'link' &&
                        (n.attributes.rel === 'preload' ||
                            n.attributes.rel === 'modulepreload') &&
                        n.attributes.as === 'script') {
                    }
                    else if (tagName === 'link' &&
                        n.attributes.rel === 'prefetch' &&
                        typeof n.attributes.href === 'string' &&
                        n.attributes.href.endsWith('.js')) {
                    }
                    else if (tagName === 'img' &&
                        n.attributes.srcset &&
                        n.attributes.rr_dataURL) {
                        node.setAttribute('rrweb-original-srcset', n.attributes.srcset);
                    }
                    else {
                        node.setAttribute(name, value.toString());
                    }
                }
                catch (error) {
                }
            }
            for (const name in specialAttributes) {
                const value = specialAttributes[name];
                if (tagName === 'canvas' && name === 'rr_dataURL') {
                    const image = document.createElement('img');
                    image.onload = () => {
                        const ctx = node.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(image, 0, 0, image.width, image.height);
                        }
                    };
                    image.src = value.toString();
                    if (node.RRNodeType)
                        node.rr_dataURL = value.toString();
                }
                else if (tagName === 'img' && name === 'rr_dataURL') {
                    const image = node;
                    if (!image.currentSrc.startsWith('data:')) {
                        image.setAttribute('rrweb-original-src', n.attributes.src);
                        image.src = value.toString();
                    }
                }
                if (name === 'rr_width') {
                    node.style.width = value.toString();
                }
                else if (name === 'rr_height') {
                    node.style.height = value.toString();
                }
                else if (name === 'rr_mediaCurrentTime' &&
                    typeof value === 'number') {
                    node.currentTime = value;
                }
                else if (name === 'rr_mediaState') {
                    switch (value) {
                        case 'played':
                            node
                                .play()
                                .catch((e) => console.warn('media playback error', e));
                            break;
                        case 'paused':
                            node.pause();
                            break;
                        default:
                    }
                }
            }
            if (n.isShadowHost) {
                if (!node.shadowRoot) {
                    node.attachShadow({ mode: 'open' });
                }
                else {
                    while (node.shadowRoot.firstChild) {
                        node.shadowRoot.removeChild(node.shadowRoot.firstChild);
                    }
                }
            }
            return node;
        }
        case NodeType.Text:
            return doc.createTextNode(n.isStyle && hackCss
                ? addHoverClass(n.textContent, cache)
                : n.textContent);
        case NodeType.CDATA:
            return doc.createCDATASection(n.textContent);
        case NodeType.Comment:
            return doc.createComment(n.textContent);
        default:
            return null;
    }
}
export function buildNodeWithSN(n, options) {
    const { doc, mirror, skipChild = false, hackCss = true, afterAppend, cache, } = options;
    if (mirror.has(n.id)) {
        const nodeInMirror = mirror.getNode(n.id);
        const meta = mirror.getMeta(nodeInMirror);
        if (isNodeMetaEqual(meta, n))
            return mirror.getNode(n.id);
    }
    let node = buildNode(n, { doc, hackCss, cache });
    if (!node) {
        return null;
    }
    if (n.rootId && mirror.getNode(n.rootId) !== doc) {
        mirror.replace(n.rootId, doc);
    }
    if (n.type === NodeType.Document) {
        doc.close();
        doc.open();
        if (n.compatMode === 'BackCompat' &&
            n.childNodes &&
            n.childNodes[0].type !== NodeType.DocumentType) {
            if (n.childNodes[0].type === NodeType.Element &&
                'xmlns' in n.childNodes[0].attributes &&
                n.childNodes[0].attributes.xmlns === 'http://www.w3.org/1999/xhtml') {
                doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">');
            }
            else {
                doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">');
            }
        }
        node = doc;
    }
    mirror.add(node, n);
    if ((n.type === NodeType.Document || n.type === NodeType.Element) &&
        !skipChild) {
        for (const childN of n.childNodes) {
            const childNode = buildNodeWithSN(childN, {
                doc,
                mirror,
                skipChild: false,
                hackCss,
                afterAppend,
                cache,
            });
            if (!childNode) {
                console.warn('Failed to rebuild', childN);
                continue;
            }
            if (childN.isShadow && isElement(node) && node.shadowRoot) {
                node.shadowRoot.appendChild(childNode);
            }
            else if (n.type === NodeType.Document &&
                childN.type == NodeType.Element) {
                const htmlElement = childNode;
                let body = null;
                htmlElement.childNodes.forEach((child) => {
                    if (child.nodeName === 'BODY')
                        body = child;
                });
                if (body) {
                    htmlElement.removeChild(body);
                    node.appendChild(childNode);
                    htmlElement.appendChild(body);
                }
                else {
                    node.appendChild(childNode);
                }
            }
            else {
                node.appendChild(childNode);
            }
            if (afterAppend) {
                afterAppend(childNode, childN.id);
            }
        }
    }
    return node;
}
function visit(mirror, onVisit) {
    function walk(node) {
        onVisit(node);
    }
    for (const id of mirror.getIds()) {
        if (mirror.has(id)) {
            walk(mirror.getNode(id));
        }
    }
}
function handleScroll(node, mirror) {
    const n = mirror.getMeta(node);
    if ((n === null || n === void 0 ? void 0 : n.type) !== NodeType.Element) {
        return;
    }
    const el = node;
    for (const name in n.attributes) {
        if (!(Object.prototype.hasOwnProperty.call(n.attributes, name) &&
            name.startsWith('rr_'))) {
            continue;
        }
        const value = n.attributes[name];
        if (name === 'rr_scrollLeft') {
            el.scrollLeft = value;
        }
        if (name === 'rr_scrollTop') {
            el.scrollTop = value;
        }
    }
}
function rebuild(n, options) {
    const { doc, onVisit, hackCss = true, afterAppend, cache, mirror = new Mirror(), } = options;
    const node = buildNodeWithSN(n, {
        doc,
        mirror,
        skipChild: false,
        hackCss,
        afterAppend,
        cache,
    });
    visit(mirror, (visitedNode) => {
        if (onVisit) {
            onVisit(visitedNode);
        }
        handleScroll(visitedNode, mirror);
    });
    return node;
}
export default rebuild;
