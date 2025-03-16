import { ShopModel } from "../models/index.js"

export const ShopService = {
    findByDomain: (domain) => {
        return ShopModel.findOne({ domain });
    },
    findAll: (filter, project = {}) => {
        return ShopModel.find(filter, project);
    },
}