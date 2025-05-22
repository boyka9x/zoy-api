import { PricingModel } from "../models/index.js";

export const PricingService = {
    findOne: ({ code }) => {
        return PricingModel.findOne({ code });
    }
};