const SEARCH_ENGINES = [
    'https://www.bing.com/',
    'https://www.google.com/',
    'https://www.yahoo.com/',
    'https://www.baidu.com/',
    'https://www.yandex.com/',
    'https://www.duckduckgo.com/',
    'https://www.ecosia.org/',
    'https://www.naver.com/',
    'https://www.seznam.cz/',
    'https://www.ask.com/',
];

const checkSearchEngines = (url) => {
    for (const searchEngine of SEARCH_ENGINES) {
        if (url && url.startsWith(searchEngine)) {
            return true;
        }
    }
    return false;
};


export const SessionHelper = {
    getSourceInfo: (source) => {
        let sourceInfo = {
            type: null,
            url: source,
        };

        if (source?.include('utm_source=')) {
            return {
                type: 'paid',
                url: source,
            }
        }

        if (checkSearchEngines(source)) {
            return {
                type: 'search',
                url: source,
            };
        }

        if (source === '') {
            return {
                type: 'direct',
                url: source,
            };
        }

        if (source) {
            return {
                type: 'referred',
                url: source,
            };
        }

        return sourceInfo;
    }
}