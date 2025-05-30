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
    groupByDate: ({ shopId }) => {
        return SessionModel.aggregate([
            Aggregate.match({
                shop: shopId,
            }),
            Aggregate.facet({
                byDate: [
                    Aggregate.group({
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }),
                    Aggregate.project({
                        _id: 0,
                        date: {
                            $dateFromParts: {
                                year: "$_id.year",
                                month: "$_id.month",
                                day: "$_id.day"
                            }
                        },
                        count: 1
                    }),
                    Aggregate.sort({ date: 1 }),
                ],
                total: [{ $count: "totalSessions" }]
            }),
            Aggregate.project({
                byDate: 1,
                total: { $arrayElemAt: ["$total.totalSessions", 0] }
            })
        ]);
    },
    analytic: ({ shopId }) => {
        return SessionModel.aggregate([
            Aggregate.match({ shop: shopId }),
            Aggregate.facet({
                os: [
                    { $group: { _id: '$os', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                device: [
                    { $group: { _id: '$device', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                browser: [
                    { $group: { _id: '$browser', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                location: [
                    { $group: { _id: '$location', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]
            })
        ]);
    },
    groupBySource: ({ shopId }) => {
        return SessionModel.aggregate([
            Aggregate.match({ shop: shopId }),
            Aggregate.group({
                _id: "$source.url",
                count: { $sum: 1 },
                type: { $first: "$source.type" }
            }),
            Aggregate.sort({ count: -1 }),
        ]);
    },
    findOneByKey: ({ shopId, key }) => {
        return SessionModel.findOne({ shop: shopId, key });
    },
}