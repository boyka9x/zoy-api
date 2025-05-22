import { Types } from "mongoose";
import { Aggregate } from "../helpers/index.js";
import { SessionModel } from "../models/index.js"

export const SessionService = {
    create: (data) => {
        return SessionModel.create(data);
    },
    updateOne: (id, data) => {
        return SessionModel.findByIdAndUpdate(id, data);
    },
    findOne: ({ visitorId, key }) => {
        return SessionModel.findOne({ visitor: visitorId, key });
    },
    find: (filter = {}, { skip = 0, limit = 10 }) => {
        return SessionModel.find(filter).skip(skip).limit(limit);
    },
    findBuildHM: ({ shopId, lastActive, limit = 100 }) => {
        return SessionModel.aggregate([
            Aggregate.match({
                shop: new Types.ObjectId(shopId),
                lastActive: { $lt: lastActive },
                $or: [
                    { hmBuilt: { $exists: false } },
                    { hmBuilt: false }
                ]
            }),
            Aggregate.limit(limit),
            Aggregate.project({
                _id: 1,
                device: 1,
            }),
        ]);
    },
    countLast24H: ({ shopId }) => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return SessionModel.countDocuments({
            shop: shopId,
            createdAt: { $gte: twentyFourHoursAgo },
        });
    },
    count: (filter = {}) => {
        return SessionModel.countDocuments(filter);
    },
}