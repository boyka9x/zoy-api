
export const EventService = {
    createMany: ({ pageviewId, events }) => {
        const insertEvents = events.map((item) => {
            return {
                ...item,
                pageView: pageviewId,
            };
        });

        return Event.insertMany(insertEvents);
    },
};