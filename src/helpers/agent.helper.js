export const AgentHelper = {
    getBrowser: (ua) => {
        const browsers = new Map([
            [ua.isFirefox, 'Firefox'],
            [ua.isOpera || ua.isOperaMini || ua.isOperaMobile, 'Opera'],
            [ua.isSafari || ua.isMobileSafari, 'Safari'],
            [ua.isIE, 'IE'],
            [ua.isEdge, 'Edge'],
            [ua.isChrome || ua.isMobileChrome, 'Chrome'],
            [ua.isUCBrowser, 'UC Browser'],
            [ua.isSamsung, 'Samsung Browser'],
            [ua.isBrave, 'Brave'],
            [ua.isVivaldi, 'Vivaldi'],
            [ua.isYandex, 'Yandex'],
            [ua.isChromium, 'Chromium'],
        ]);

        return [...browsers].find(([key]) => key)?.[1] ?? 'Unknown';
    },
    getOs: (ua) => {
        const osList = new Map([
            [ua.isMac && (ua.isiPhone || ua.isiPad || ua.isiPod), 'iOS'],
            [ua.isMac, 'Mac OS'],
            [ua.isWindows, 'Windows'],
            [ua.isAndroid, 'Android'],
            [ua.isLinux, 'Linux'],
            [ua.isChromeOS, 'Chrome OS'],
            [ua.isBlackberry, 'BlackBerry'],
            [ua.isWindowsPhone, 'Windows Phone'],
            [ua.isFirefoxOS, 'Firefox OS'],
            [ua.isWebOS, 'WebOS'],
            [ua.isBada, 'Bada'],
            [ua.isTizen, 'Tizen'],
            [ua.isSailfish, 'Sailfish'],
            [ua.isFreeBSD || ua.isOpenBSD || ua.isNetBSD, 'BSD'],
            [ua.isSolaris, 'Solaris'],
        ]);

        return [...osList].find(([key]) => key)?.[1] ?? 'Unknown';
    },
    getDevice: (ua) => {
        return ua.isDesktop ? 'Desktop' : ua.isTablet ? 'Tablet' : ua.isMobile ? 'Mobile' : 'Unknown';
    }
};
