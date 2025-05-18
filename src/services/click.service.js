import { Types } from "mongoose";
import { Aggregate } from "../helpers/mongo.helper.js";
import { ClickModel, PageviewModel } from "../models/index.js";

export const ClickService = {
    deleteMany: async (filter) => {
        return ClickModel.deleteMany(filter);
    },
    bulkUpsert: async (points) => {
        for (const point of points) {
            const { counts, ...data } = point;
            const filter = {
                pageview: new Types.ObjectId(data.pageview),
                x: data.x,
                y: data.y,
                selector: data.selector,
                textContent: data.textContent,
            };
            if (data?.type) {
                filter.type = data.type;
            }
            await ClickModel.updateOne(filter, { $inc: { counts }, $setOnInsert: { ...data } }, { upsert: true });
        }

    },
    findAll: async ({ shopId, page, type, device, from, to }) => {
        let filterType = { type: null };
        if (type) {
            filterType = { type: type };
        }

        return PageviewModel.aggregate([
            Aggregate.match({
                shop: shopId,
                href: page,
                // createdAt: {
                //     $gte: new Date(from),
                //     $lt: new Date(to)
                // },
                ...(type ? { type } : {}),
            }),
            Aggregate.lookup({
                from: 'sessions',
                localField: 'session',
                foreignField: '_id',
                pipeline: [
                    Aggregate.project({
                        device: 1,
                    }),
                    ...(device ? [Aggregate.match({ device: device })] : []),
                ],
                as: 'session',
            }),
            Aggregate.unwind({ path: '$session' }),
            Aggregate.lookup({
                from: 'clicks',
                localField: '_id',
                foreignField: 'pageview',
                as: 'click',
                pipeline: [Aggregate.match(filterType)],
            }),
            Aggregate.unwind('$click'),
            { $replaceRoot: { newRoot: '$click' } },
            Aggregate.project({
                _id: 1,
                query: 1,
                textContent: 1,
                x: 1,
                y: 1,
                counts: 1,
            }),
        ]);
    }
}