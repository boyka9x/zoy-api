import { Aggregate } from "../helpers/mongo.helper.js";
import { VisitorModel } from "../models/index.js"

export const VisitorService = {
    create: (data) => {
        return VisitorModel.create(data);
    },
    updateOne: (id, data) => {
        return VisitorModel.findByIdAndUpdate(id, data);
    },
    findOne: ({ shopId, key }) => {
        return VisitorModel.findOne({ shop: shopId, key });
    },
    groupByDate: ({ shopId }) => {
        return VisitorModel.aggregate([
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
                total: [{ $count: "totalVisitors" }]
            }),
            Aggregate.project({
                byDate: 1,
                total: { $arrayElemAt: ["$total.totalVisitors", 0] }
            })
        ]);
    },
    findAll: ({ shopId }) => {
        return VisitorModel.aggregate([
            Aggregate.match({
                shop: shopId,
            }),
            Aggregate.sort({ lastActive: -1 }),
            Aggregate.lookup({
                from: 'sessions',
                localField: '_id',
                foreignField: 'visitor',
                as: 'session',
            }),
            Aggregate.project({
                _id: 1,
                key: 1,
                os: 1,
                device: 1,
                browser: 1,
                location: 1,
                ips: 1,
                lastActive: 1,
                display_id: 1,
                sessionCount: { $size: '$session' },
            }),
        ]);
    }
}