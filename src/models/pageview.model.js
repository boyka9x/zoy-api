import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PageviewSchema = new Schema({
    key: { type: String, required: true },
    href: { type: String, required: true },
    title: { type: String },
    width: { type: Number, required: true, default: 0 },
    height: { type: Number, required: true, default: 0 },
    startTime: { type: String },
    hmTime: { type: Number },

    shop: { type: Schema.Types.ObjectId, ref: 'shops' },
    session: { type: Schema.Types.ObjectId, ref: 'sessions' },
}, {
    timestamps: true,
    versionKey: false,
});

PageviewSchema.index({ key: 1 });
PageviewSchema.index({ shop: 1 });
PageviewSchema.index({ session: 1 });

export const PageviewModel = mongoose.model('pageviews', PageviewSchema);
