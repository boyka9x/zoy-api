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
}