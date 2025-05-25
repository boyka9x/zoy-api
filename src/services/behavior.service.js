import { BehaviorModel } from "../models/index.js";

export const BehaviorService = {
    createMany: (behaviors) => {
        return BehaviorModel.insertMany(behaviors);
    },
};