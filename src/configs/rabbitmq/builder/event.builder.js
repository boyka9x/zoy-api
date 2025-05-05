const HEATMAP_VIEW_PORT = {
    DESKTOP: {
        WIDTH: 1920,
        HEIGHT: 1080,
    },
    TABLET: {
        WIDTH: 1024,
        HEIGHT: 768,
    },
    MOBILE: {
        WIDTH: 412,
        HEIGHT: 824,
    },
};

export const EventBuilder = {
    buildToStandardSize: ({ device, pageview, data }) => {
        const viewport = HEATMAP_VIEW_PORT[device.toUpperCase()];

        if (!viewport || pageview.width === 0 || pageview.height === 0) return false;

        const scaleX = viewport.WIDTH / pageview.width;
        const scaleY = viewport.HEIGHT / pageview.height;

        return {
            x: parseInt(data.x * scaleX),
            y: parseInt(data.y * scaleY),
        };
    },

}