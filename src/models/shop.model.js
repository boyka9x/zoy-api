import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ShopSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    domain: { type: String, required: true },
    code: { type: String, required: true },
    status: { type: Boolean, required: true, default: true },
    username: { type: String },
    session_count: { type: Number, default: 0 },
}, {
    timestamps: true,
});

ShopSchema.index({ email: 1 });
ShopSchema.index({ domain: 1 });

export const ShopModel = mongoose.model('shops', ShopSchema);