const CSS_SELECTOR_MAX_DEPTH = 3;
const CSS_SELECTOR_MAX_CLASSES = 3;
const TEXT_CONTENT_MAX_LENGTH = 100;

const searchParentNode = (childId, root) => {
    if (!root || !root.childNodes) return null;

    // Check direct children
    for (const child of root.childNodes) {
        if (child.id === childId) {
            return root;
        }
    }

    // Recurse through children
    for (const child of root.childNodes) {
        const found = searchParentNode(childId, child);
        if (found) return found;
    }

    return null;
}

const getNodeTextContent = (node) => {
    // Base case: text node
    if (node.type === 3) {
        let textNode = node.textContent || '';
        if (textNode) {
            textNode = textNode.trim().replace(/\s+/g, ' ').slice(0, TEXT_CONTENT_MAX_LENGTH);
        }
        return textNode;
    }

    // Recursive case: element node with children
    let text = '';
    if (node.childNodes) {
        for (const child of node.childNodes) {
            text += getNodeTextContent(child);
            text = text.trim().replace(/\s+/g, ' ');
            if (text.length >= TEXT_CONTENT_MAX_LENGTH) {
                return text.slice(0, TEXT_CONTENT_MAX_LENGTH);
            }
        }
    }

    return text;
}

export const SnapshotHelper = {
    searchNode: (key, tree) => {
        if (!tree) return null;

        const queue = [tree];

        while (queue.length > 0) {
            const currentNode = queue.pop();

            if (currentNode?.id === key) {
                return currentNode;
            }

            const childNodes = currentNode?.childNodes;
            if (Array.isArray(childNodes) && childNodes.length > 0) {
                queue.push(...childNodes);
            }
        }

        return null;
    },
    getSelector: (node, snapshot) => {
        if (!node || typeof node !== 'object') {
            return null;
        }

        if (!('childNodes' in node)) {
            return null;
        }

        const selectors = [];
        let currentNode = node;
        let depth = 0;

        while (currentNode && depth < CSS_SELECTOR_MAX_DEPTH) {

            if (currentNode.type === 2) {
                let selector = currentNode.tagName;


                if (currentNode.attributes && currentNode.attributes.id) {
                    const id = currentNode.attributes.id;
                    if (/^[0-9]/.test(id) || /[&#.,]/g.test(id)) {
                        selector += `[id='${id}']`;
                    } else {
                        selector += `#${id}`;
                    }
                }

                else if (currentNode.attributes && currentNode.attributes.class) {
                    const classes = currentNode.attributes.class.split(' ');
                    let classCount = 0;

                    for (const className of classes) {
                        if (className && classCount < CSS_SELECTOR_MAX_CLASSES) {
                            if (/[:[\]&_]/.test(className)) {
                                continue;
                            }

                            if (/^[0-9]/.test(className) || /[&#.,]/g.test(className)) {
                                selector += `[class='${className}']`;
                            } else {
                                selector += `.${className}`;
                            }
                            classCount++;
                        }
                    }
                }

                else if (depth != CSS_SELECTOR_MAX_DEPTH - 1 && selector === currentNode.tagName) {
                    const parentNode = searchParentNode(currentNode.id, snapshot.data.node);
                    if (parentNode) {
                        const siblings = parentNode.childNodes.filter((n) => n.tagName);
                        if (siblings.length) {
                            const index = siblings.indexOf(currentNode);
                            if (index > 0) {
                                selector += `:nth-child(${index + 1})`;
                            }
                        }
                    }
                }

                selectors.unshift(selector);
            }

            currentNode = searchParentNode(currentNode.id, snapshot.data.node);
            depth++;
        }

        return selectors.join(' > ');

    },
    getTextContent: (node) => {
        // Base case: text node
        if (node.type === 3) {
            let textNode = node.textContent || '';
            if (textNode) {
                textNode = textNode.trim().replace(/\s+/g, ' ').slice(0, TEXT_CONTENT_MAX_LENGTH);
            }
            return textNode;
        }

        // Recursive case: element node with children
        let text = '';
        if (node.childNodes) {
            for (const child of node.childNodes) {
                text += getNodeTextContent(child);
                text = text.trim().replace(/\s+/g, ' ');
                if (text.length >= TEXT_CONTENT_MAX_LENGTH) {
                    return text.slice(0, TEXT_CONTENT_MAX_LENGTH);
                }
            }
        }

        return text;

    },
}