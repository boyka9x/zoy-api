import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ShopSchema = new Schema({
    status: { type: Boolean, required: true, default: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    domain: { type: String, required: true },
    code: { type: String, required: true },
    username: { type: String },
    session_count: { type: Number, default: 0 },
    shopify_token: { type: String },
    pixel_id: { type: String },
    modules: {
        enableRecord: { type: Boolean, default: true },
    },
    pricing: {
        id: { type: Schema.Types.ObjectId, ref: 'pricings' },
        title: { type: String, default: 'Free' },
        code: { type: String, default: 'free' },
        price: { type: Number, default: 0 },
        session_limit: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
    versionKey: false,
});

ShopSchema.index({ email: 1 });
ShopSchema.index({ domain: 1 });

export const ShopModel = mongoose.model('shops', ShopSchema);