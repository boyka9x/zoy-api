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
            Aggregate.replaceRoot({ newRoot: '$events' }),
            Aggregate.sort({ timestamp: 1 }),
        ]);
    },
    findBuildHM: ({ pageviewId, hmTime }) => {
        const filters = {};
        if (hmTime) {
            filters.timestamp = { $gt: parseInt(hmTime) };
        }

        return EventModel.aggregate([
            Aggregate.match({
                pageview: pageviewId,
                type: 3,
                hmType: 1,
                ...filters,
            }),
            Aggregate.project({
                pageview: 0
            }),
        ])
    },
    findSnapshot: async (pageviewId) => {
        return EventModel.findOne({ pageview: pageviewId, type: 2 });
    }
};