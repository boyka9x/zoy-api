import mongoose from "mongoose";

const Schema = mongoose.Schema;

const VisitorSchema = new Schema({
    key: { type: String, required: true },
    os: { type: String },
    device: { type: String },
    browser: { type: String },
    location: { type: String },
    ips: [{ type: String }],
    lastActive: { type: Date },

    shop: { type: Schema.Types.ObjectId, ref: 'shops' },
}, {
    timestamps: true,
    versionKey: false,
});

VisitorSchema.index({ key: 1 });
VisitorSchema.index({ shop: 1 });
VisitorSchema.index({ lastActive: 1 });

export const VisitorModel = mongoose.model('visitors', VisitorSchema);