import { Aggregate } from "../helpers/mongo.helper.js";
import { PageviewModel } from "../models/index.js"

export const PageviewService = {
    create: (data) => {
        return PageviewModel.create(data);
    },
    updateOne: (filter, data) => {
        return PageviewModel.updateOne(filter, data);
    },
    findOne: ({ sessionId, key }) => {
        return PageviewModel.findOne({ session: sessionId, key });
    },
    findBySessionId: ({ sessionId, limit = 100 }) => {
        return PageviewModel.find({ session: sessionId, hmTime: { $ne: 1 } }).limit(limit);
    },
    findByPage: async ({ shopId, href, device, limit = 5 }) => {
        const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);

        return PageviewModel.aggregate([
            Aggregate.match({
                shop: shopId,
                href: { $regex: href, $options: 'i' },
                hmTime: { $ne: 1 }
            }),
            Aggregate.lookup({
                from: 'sessions',
                localField: 'session',
                foreignField: '_id',
                as: 'session',
            }),
            Aggregate.unwind({ path: '$session' }),
            Aggregate.match({
                'session.device': device,
                'session.lastActive': { $gte: THIRTY_MINUTES_AGO },
            }),
            Aggregate.limit(limit),
        ]);
    }
}