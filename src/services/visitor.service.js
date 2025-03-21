import { VisitorModel } from "../models/index.js"

export const VisitorService = {
    create: (data) => {
        return VisitorModel.create(data);
    },
    updateOne: (id, data) => {
        return VisitorModel.findByIdAndUpdate(id, data);
    },
    findOne: ({ shopId, visitorKey }) => {
        return VisitorModel.findOne({ shop: shopId, key: visitorKey });
    }
}