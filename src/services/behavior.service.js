import { Aggregate } from "../helpers/mongo.helper.js";
import { BehaviorModel } from "../models/index.js";

export const BehaviorService = {
    createMany: (behaviors) => {
        return BehaviorModel.insertMany(behaviors);
    },
    groupByType: ({ shopId }) => {
        return BehaviorModel.aggregate([
            Aggregate.match({
                shop: shopId,
            }),
            Aggregate.group({
                _id: "$type",
                count: { $sum: 1 },
            }),
            Aggregate.project({
                _id: 0,
                type: "$_id",
                count: 1,
            }),
        ]);
    }
};