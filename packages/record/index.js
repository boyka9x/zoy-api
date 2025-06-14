import { getReferrer } from "./helpers/common.helper";
import { initKey } from "./helpers/key.helper";
import { initPingUrl } from "./helpers/session.helper";
import { loadRecorder } from "./modules/record.module";

const initialRecord = (() => {
    const states = {
        session: '',
        visitor: '',
        pageview: '',
        pingUrl: '',
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        saving: false,
        block: false,
        events: [],
        firstActive: Date.now(),
        lastActive: Date.now(),
        domVisible: true,
        firstLoadVisible: !document.hidden,
        source: getReferrer(),

        logs: []
    }

    const initialFunction = () => {
        try {
            // Init
            initKey(states);
            initPingUrl(states);

            // Load rrweb
            loadRecorder(states);
        } catch (error) {
            states.logs.push(error);
        }
    }

    initialFunction();

    const getStates = () => {
        return states;
    }

    return {
        getStates,
    }
})();

window.zoy = initialRecord.getStates();