import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PricingSchema = new Schema({
    title: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    session_limit: { type: Number, required: true },
}, {
    timestamps: true,
    versionKey: false,
});

export const PricingModel = mongoose.model('pricings', PricingSchema);