import { v4 } from 'uuid';

import { CREATE_PAGE, CREATE_SESSION, PAGE_KEY, SESSION_KEY, VISITOR_KEY } from '../constants/record.constant';
import { createNewSession, isExpiredSession } from './session.helper';

export const loadPageviewKey = () => {
    let value = v4();
    window.localStorage.setItem(PAGE_KEY, value);
    return value;
};

export const loadVisitorKey = () => {
    let value = window.localStorage.getItem(VISITOR_KEY);

    if (!value) {
        value = v4();
        localStorage.setItem(VISITOR_KEY, value);
    }

    return value;
};

export const loadSessionKey = () => {
    const value = window.localStorage.getItem(SESSION_KEY);

    if (!value || isExpiredSession()) {
        return createNewSession();
    }

    return value;
};

export const initKey = (states) => {
    const pageviewId = loadPageviewKey();
    const visitorId = loadVisitorKey();
    const sessionId = loadSessionKey();

    // Public create session
    window.addEventListener(CREATE_SESSION, () => {
        states.pageview = pageviewId;
        states.session = createNewSession();
        window.zoy = { ...states };
    });

    window.addEventListener(CREATE_PAGE, () => {
        states.pageview = loadPageviewKey();
        console.log("page")
        window.zoy = { ...states };
    });

    states.pageview = pageviewId;
    states.visitor = visitorId;
    states.session = sessionId;
};
