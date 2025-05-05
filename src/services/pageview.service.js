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
        return PageviewModel.find({ session: sessionId }).limit(limit);
    },
}