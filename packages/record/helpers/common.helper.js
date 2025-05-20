import { gzipSync, strToU8 } from 'fflate';

export const getLocalStorage = (key) => {
    return localStorage.getItem(key);
};

export const setLocalStorage = (key, value) => {
    return localStorage.setItem(key, value);
};

export const encodeBody = (data) => {
    if (!data) return;

    const jsonString = JSON.stringify(data);
    return gzipSync(strToU8(jsonString));
};

export const getReferrer = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {
        return `utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    }

    return window.frames.top.document.referrer
};