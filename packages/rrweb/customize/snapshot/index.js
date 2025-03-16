const REGEX_SHOPIFY_CDN_VERSION = /(?:cdn\.shopify\.com|cdn\/shop\/t).*\?v=\d+/;
const REGEX_FILENAME_CSS = /\/([^\/?]+\.css)/;

export function checkIsShopifyCdnVersion(href) {
    return REGEX_SHOPIFY_CDN_VERSION.test(href);
}

export function getFileName(href) {
    const match = href.match(REGEX_FILENAME_CSS);
    return match ? match[1] : null;
}

export function cdnOutsideShopify(tagName, attr) {
    if (
        tagName === 'link' &&
        attr.name === 'href' &&
        attr.value.includes('.css') &&
        !checkIsShopifyCdnVersion(attr.value)
    ) {
        return true;
    }
    return false;
}
