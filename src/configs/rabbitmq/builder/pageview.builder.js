import { EventService, PageviewService, SessionService } from "../../../services/index.js";
import { initClickBuilder } from "./click.builder.js";

export const PageviewBuilder = {
    buildHM: async ({ sessionId, device }) => {
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
                    const ClickBuilder = initClickBuilder({ device, pageview });

                    const snapshot = await EventService.findSnapshot(pageview._id);
                    if (!snapshot || !snapshot.data) {
                        continue;
                    }

                    const eventCursor = EventService.findBuildHM({
                        pageviewId: pageview._id,
                        hmTime: pageview?.hmTime,
                    }).cursor({
                        batchSize: 100,
                    });

                    await eventCursor.eachAsync(async (events) => {
                        await ClickBuilder.process(events, snapshot);
                    });

                    await eventCursor.close();
                    await ClickBuilder.end();
                    await PageviewService.updateOne({ _id: pageview._id }, { hmTime: 1 });
                }
            } while (pageviews.length === 100);

            await SessionService.updateOne(sessionId, { hmBuilt: true })
        } catch (error) {
            console.error('PageviewBuilder', error.message);
        }
    },
    buildRealtimeHM: async ({ shopId, href, device }) => {
        try {
            let pageviews = [];

            do {
                pageviews = await PageviewService.findByPage({
                    shopId,
                    href,
                    device,
                });

                if (!pageviews.length) {
                    break;
                }

                for (const pageview of pageviews) {
                    const ClickBuilder = initClickBuilder({ device, pageview });

                    const snapshot = await EventService.findSnapshot(pageview._id);
                    if (!snapshot || !snapshot.data) {
                        continue;
                    }

                    const eventCursor = EventService.findBuildHM({
                        pageviewId: pageview._id,
                        hmTime: pageview?.hmTime,
                    }).cursor({
                        batchSize: 100,
                    });

                    let timeHM;
                    await eventCursor.eachAsync(async (events) => {
                        await ClickBuilder.process(events, snapshot);
                    });

                    await eventCursor.close();
                    await ClickBuilder.endRealtime();
                    await PageviewService.updateOne({ _id: pageview._id }, { hmTime: 1 });
                }
            } while (pageviews.length === 100);

            await SessionService.updateOne(sessionId, { hmBuilt: true })
        } catch (error) {
            console.error('PageviewBuilder', error.message);
        }
    }
}