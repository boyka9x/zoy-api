import { SessionModel } from "../models/index.js"

export const SessionService = {
    create: (data) => {
        return SessionModel.create(data);
    },
    updateOne: (id, data) => {
        return SessionModel.findByIdAndUpdate(id, data);
    },
    findOne: ({ visitorId, key }) => {
        return SessionModel.findOne({ visitor: visitorId, key });
    },
    find: (filter = {}) => {
        return SessionModel.find(filter);
    },
}