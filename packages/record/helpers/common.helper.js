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