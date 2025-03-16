import { v4 } from "uuid";
import { HOTA_BODY, SESSION_FIRST_PING, SESSION_KEY, SESSION_LAST_ACTIVE } from "../constants/record.constant";
import { encodeBody, getLocalStorage } from "./common.helper";
import { SERVER_URL } from "../constants/host.constant";

export const createNewSession = () => {
    const value = v4();

    localStorage.setItem(SESSION_KEY, value);
    sessionStorage.setItem(SESSION_FIRST_PING, 'true');
    localStorage.setItem(SESSION_LAST_ACTIVE, Date.now());

    return value;
};

export const isExpiredSession = () => {
    const lastActive = getLocalStorage(SESSION_LAST_ACTIVE);

    if (lastActive) {
        const currentTime = Date.now();
        const lastActiveTime = parseInt(lastActive);

        if (currentTime - lastActiveTime < 30 * 60 * 1000) {
            return false;
        }
    }

    return true;
};

export const initPingUrl = (states) => {
    const sessionPingUrl =
        `${SERVER_URL}/ping` +
        `?_p=${states.pageview}` +
        `&_v=${states.visitor}` +
        `&_s=${states.session}` +
        `&_c=${window.ZOY_CODE}` +
        `&domain=${window.location.hostname}`;

    states.pingUrl = sessionPingUrl;
};

export const checkInvalidFirstPing = (events) => {
    const firstPing = sessionStorage.getItem(SESSION_FIRST_PING);
    if (firstPing && firstPing === 'true') {
        const eventTypeArray = events.map((event) => event.type);
        if (!eventTypeArray.includes(2) || !eventTypeArray.includes(4)) {
            return false;
        }
        sessionStorage.setItem(SESSION_FIRST_PING, 'false');
    }

    return true;
};

export const saveEvents = (recordState) => {
    recordState.saving = true;
    const events = Array.isArray(recordState.events) ? [...recordState.events] : [];
    const eventString = JSON.stringify(events);

    if (eventString.length >= HOTA_BODY) {
        const invalidFirstPing = checkInvalidFirstPing(events);
        if (!invalidFirstPing) {
            recordState.events = [];
            recordState.block = true;
            return;
        }

        recordState.events.splice(0, events.length);
        // Ping session events to server
        fetch(recordState.pingUrl, {
            method: 'POST',
            headers: {
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json'
            },
            body: encodeBody({
                events,
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                recordState.block = json.block;
            })
            .catch((err) => {
                recordState.block = true;
                recordState.logs.push(err);
            })
            .finally(() => {
                recordState.saving = false;
            });
    } else {
        recordState.saving = false;
    }
};

export const saveBeaconEvents = (recordState) => {
    const eventLength = recordState.events.length;
    if (!eventLength || eventLength <= 0) return;

    const invalidFirstPing = checkInvalidFirstPing(recordState.events);
    if (!invalidFirstPing) {
        recordState.block = true;
        recordState.events = [];
        return;
    }

    recordState.saving = true;
    recordState.events.splice(0, eventLength);
    fetch(recordState.pingUrl, {
        method: 'POST',
        keepalive: true,
        headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json'
        },
        body: encodeBody({
            events: recordState.events,
        }),
    })
        .then((res) => res.json())
        .then((json) => {
            recordState.block = json.block;
        })
        .catch((err) => {
            recordState.block = true;
            recordState.logs.push(err);
        })
        .finally(() => {
            recordState.saving = false;
        });
};
