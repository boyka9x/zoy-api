import { SessionModel } from "../models/index.js"

export const sessionService = {
    create: (data) => {
        return SessionModel.create(data);
    },
    updateOne: (id, data) => {
        return SessionModel.findByIdAndUpdate(id, data);
    },
}