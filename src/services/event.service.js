import { Aggregate, convertObjectId } from "../helpers/index.js";
import { EventModel, PageviewModel } from "../models/index.js";

export const EventService = {
    createMany: ({ pageviewId, events }) => {
        const insertEvents = events.map((item) => {
            return {
                ...item,
                pageview: pageviewId,
            };
        });

        return EventModel.insertMany(insertEvents);
    },
    findBySession: (sessionId) => {
        return PageviewModel.aggregate([
            Aggregate.match({
                session: convertObjectId(sessionId),
            }),
            Aggregate.lookup({
                from: 'events',
                localField: '_id',
                foreignField: 'pageview',
                as: 'events',
            }),
            Aggregate.unwind({ path: '$events' }),
            Aggregate.replaceRoot({ newRoot: '$events' })
        ]);
    }
};