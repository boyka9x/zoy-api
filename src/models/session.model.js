import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    key: { type: String, required: true },
    viewed: { type: Boolean, required: true, default: false },
    os: { type: String },
    device: { type: String },
    browser: { type: String },
    location: { type: String },
    ip: { type: String },
    duration: { type: Number, required: false },
    startTime: { type: String },
    lastActive: { type: Date, required: false },

    shop: { type: Schema.Types.ObjectId, ref: 'shops' },
    visitor: { type: Schema.Types.ObjectId, ref: 'visitors' },
}, {
    timestamps: true,
    versionKey: false,
});

SessionSchema.index({ key: 1 });
SessionSchema.index({ shop: 1 });
SessionSchema.index({ visitor: 1 });
SessionSchema.index({ last_active: 1 });

export const SessionModel = mongoose.model('sessions', SessionSchema);