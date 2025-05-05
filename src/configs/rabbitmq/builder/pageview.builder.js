
export const PageviewBuilder = {
    buildHM: async ({ shopId, sessionId, device }) => {
        try {
            let pageviews = [];

            do {
                pageviews = await PageviewService.findBySessionId({
                    sessionId,
                    limit: 100,
                });

                if (!pageviews.length) {
                    break;
                }

                for (const pageview of pageviews) {

                }
            } while (pageviews.length === 100);
        } catch (error) {
            console.error('PageviewBuilder', error.message);
        }
    }
}