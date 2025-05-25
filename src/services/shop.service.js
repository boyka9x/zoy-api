import { Aggregate } from "../helpers/mongo.helper.js";
import { ShopModel } from "../models/index.js"

export const ShopService = {
    findByDomain: (domain) => {
        return ShopModel.findOne({ domain });
    },
    findAll: (filter, project = {}) => {
        return ShopModel.find(filter, project);
    },
    findOne: (filter, project = {}) => {
        return ShopModel.findOne(filter, project);
    },
    create: (data) => {
        return ShopModel.create(data);
    },
    updateModule: ({ domain, data }) => {
        return ShopModel.updateOne({ domain }, { $set: data });
    },
    findBuildHM: () => {
        return ShopModel.aggregate([
            Aggregate.match({
                status: true,
            }),
            Aggregate.project({ domain: 1 }),
            // Aggregate.lookup({
            //     from: 'sessions',
            //     let: { shopId: '$_id' },
            //     pipeline: [
            //         {
            //             $match: {
            //                 $expr: {
            //                     $and: [
            //                         { $eq: ['$shop', '$$shopId'] },
            //                         { $eq: ['$hmBuilt', false] },
            //                         { $gte: ['$lastActive', new Date(Date.now() - 30 * 60 * 1000)] }
            //                     ]
            //                 }
            //             }
            //         },
            //         { $limit: 1 }
            //     ],
            //     as: 'session'
            // }),
            // Aggregate.match({
            //     'session.0': { $exists: true },
            // }),
        ]);
    },
    updatePricing: ({ domain, pricing }) => {
        return ShopModel.updateOne({ domain }, { pricing });
    },
    updateOne: (filter, update) => {
        return ShopModel.updateOne(filter, update);
    },
    updateIntegration: ({ shopId, shopify_domain }) => {
        return ShopModel.updateOne({ _id: shopId }, { $set: { shopify_domain } });
    },
}