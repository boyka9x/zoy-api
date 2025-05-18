import { Types } from "mongoose";
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
                // hmTime: { $ne: 1 }
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
                // 'session.lastActive': { $gte: THIRTY_MINUTES_AGO },
            }),
            Aggregate.limit(limit),
        ]);
    },
    listPage: async ({ shopId, from, to, limit = 5, skip = 0 }) => {
        return PageviewModel.aggregate([
            Aggregate.match({
                shop: shopId,
                // createdAt: {
                //     $gte: new Date(from),
                //     $lte: new Date(to),
                // },
            }),
            Aggregate.lookup({
                from: 'sessions',
                localField: 'session',
                foreignField: '_id',
                as: 'session',
            }),
            Aggregate.unwind({ path: '$session' }),
            Aggregate.group({
                _id: { href: '$href', device: '$session.device' },
                count: { $sum: 1 },
                title: { $first: '$title' }
            }),
            Aggregate.group({
                _id: '$_id.href',
                counts: { $sum: '$count' },
                device: { $push: { k: '$_id.device', v: '$count' } },
                title: { $first: '$title' }
            }),
            Aggregate.sort({ counts: -1 }),
            Aggregate.skip(skip),
            Aggregate.limit(limit),
            Aggregate.project({
                _id: 0,
                href: '$_id',
                counts: 1,
                title: 1,
                device: { $arrayToObject: '$device' },
            }),
        ])
    },
    countPage: async ({ shopId, from, to }) => {

        return PageviewModel.aggregate([
            Aggregate.match({
                shop: shopId,
                // createdAt: {
                //     $gte: new Date(from),
                //     $lte: new Date(to),
                // },
            }),
            Aggregate.group({
                _id: "$href",
            }),
            Aggregate.count("count"),
        ]);
    },
    findLast: async ({ shopId, href, device }) => {
        return PageviewModel.aggregate([
            Aggregate.match({
                shop: new Types.ObjectId(shopId),
                href
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
            }),
            Aggregate.sort({ createdAt: -1 }),
            Aggregate.limit(1),
        ]);
    },
}