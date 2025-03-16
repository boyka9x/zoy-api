
import rrwebRecord from '../../rrweb/record/index';
import { CREATE_PAGE, CREATE_SESSION, SESSION_FIRST_PING, SESSION_LAST_ACTIVE } from '../constants/record.constant';
import { _1_MINUTES, _30_MINUTES } from '../constants/time.constant';
import { getLocalStorage, setLocalStorage } from '../helpers/common.helper';
import { initPingUrl, saveBeaconEvents, saveEvents } from '../helpers/session.helper';
export const initRecorder = (recordState) => {
    rrwebRecord({
        emit(event) {
            if (!recordState.block && recordState.firstLoadVisible) {
                let addEvent = false;
                let timeNow = Date.now();
                if (!recordState.domVisible) {
                    if (event.timestamp - recordState.lastActive > _1_MINUTES) {
                        return;
                    }
                }
                // Create new session if expired 30m
                if (event.timestamp - recordState.lastActive > _30_MINUTES) {
                    console.log('Expired session');
                    if (recordState.events.length) {
                        const eventFiltered = recordState.events.filter((_event) => {
                            if (_event.timestamp - recordState.lastActive < _30_MINUTES) {
                                return true;
                            }
                        });
                        recordState.events = eventFiltered;
                    }
                    saveBeaconEvents(recordState);

                    recordState.events = [];
                    if (recordState.domVisible) {
                        recordState.lastActive = timeNow;
                    }
                    const newSession = new Event(CREATE_SESSION);
                    window.dispatchEvent(newSession);
                    initPingUrl(recordState, window.zoy);
                    initRecorder(recordState);
                }

                if (event.type === 2) {
                    // Todo something
                }
                if (event.type === 4) {
                    recordState.firstActive = event.timestamp;
                }
                // Type 3
                if (event.type === 3 && event.data) {
                    const { source, type, x } = event.data;

                    switch (source) {
                        case 1:
                            event.hmType = 2;
                            break;
                        case 2:
                            if (type === 2) {
                                event.hmType = 1;
                            }
                            break;
                        case 3: {
                            const offsetHeight = document.scrollingElement.offsetHeight;
                            if (x !== undefined && x === 0) {
                                event.hmType = 3;
                                event.data.offsetHeight = offsetHeight;
                            }
                            break;
                        }
                        case 0:
                        case 7:
                        case 8:
                            if (timeNow - recordState.lastActive < 10 * 1000) {
                                recordState.events.push(event);
                                if (recordState.domVisible) {
                                    recordState.lastActive = timeNow;
                                }
                                addEvent = true;
                            }
                            break;
                        default:
                            break;
                    }
                }

                if (!addEvent) {
                    recordState.events.push(event);
                    if (recordState.domVisible) {
                        recordState.lastActive = timeNow;
                    }
                }
                if (!recordState.saving && !recordState.block) {
                    saveEvents(recordState);
                }
            }
        },
        inlineStylesheet: false,
        errorHandler: (error) => {
            console.log('[ZOY errorHandler]: ', error);
        },
    });

    document.onvisibilitychange = () => {
        if (document.visibilityState === 'hidden') {
            recordState.domVisible = false;
            // Last active visibility
            const timeNow = Date.now();
            recordState.lastActive = timeNow;
            setLocalStorage(SESSION_LAST_ACTIVE, timeNow);

            if (!recordState.block) {
                saveBeaconEvents(recordState);
            }
        } else {
            recordState.domVisible = true;
            recordState.firstLoadVisible = true;
            const sessionKey = getLocalStorage(SESSION_KEY);
            const lastActive = getLocalStorage(SESSION_LAST_ACTIVE) || Date.now();

            const isTabActive = recordState.lastActive === parseInt(lastActive);
            recordState.lastActive = lastActive;

            if (window.zoy.session = sessionKey && isTabActive) {
                return;
            }

            if (!isTabActive) {
                const newPage = new Event(CREATE_PAGE);
                window.dispatchEvent(newPage);
            }

            // Reset ping
            recordState.events = [];
            sessionStorage.setItem(SESSION_FIRST_PING, 'true');
            window.msr.session = sessionKey;

            loadPingUrl(recordState, window.zoy);
            initRecorder(recordState);
        }
    };
};
