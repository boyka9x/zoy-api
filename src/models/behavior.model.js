import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BehaviorSchema = new Schema({
    type: { type: String },
    data: { type: Object },
    timestamp: { type: Number, required: true },

    shop: { type: Schema.Types.ObjectId, ref: 'shops' },
    pageview: { type: Schema.Types.ObjectId, ref: 'pageviews' },
    session: { type: Schema.Types.ObjectId, ref: 'sessions' },
}, {
    timestamps: false
});

BehaviorSchema.index({ shop: 1 });
BehaviorSchema.index({ pageview: 1 });
BehaviorSchema.index({ session: 1 });