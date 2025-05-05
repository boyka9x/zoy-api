import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MoveSchema = new Schema({
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

MoveSchema.index({ pageview: 1 });
MoveSchema.index({ date: 1 });

export const MoveModel = mongoose.model('moves', MoveSchema);