import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ClickSchema = new Schema({
    date: { type: Date },
    type: { type: String },
    x: { type: Number },
    y: { type: Number },
    counts: { type: Number },
    selector: { type: String },
    textContent: { type: String },

    pageview: { type: Schema.Types.ObjectId, ref: 'pageviews' },
}, {
    timestamps: true,
    versionKey: false,
});

ClickSchema.index({ pageview: 1 });
ClickSchema.index({ date: 1 });

export const ClickModel = mongoose.model('clicks', ClickSchema);