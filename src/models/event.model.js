import mongoose from "mongoose";

const Schema = mongoose.Schema;

const EventSchema = new Schema({
    type: { type: Number, required: true },
    hmType: { type: Number },
    data: { type: Object },
    timestamp: { type: Number, required: true },

    pageview: { type: Schema.Types.ObjectId, ref: 'pageviews' },
}, {
    timestamps: false,
    versionKey: false,
});

EventSchema.index({ pageview: 1 });
EventSchema.index({ timestamp: 1 });

export const EventModel = mongoose.model('events', EventSchema);