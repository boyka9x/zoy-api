import mongoose from "mongoose";
import { PricingConfig } from "../pricing/index.js";

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,
            {
                ignoreUndefined: true,
            }
        );

        await PricingConfig.init();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Failed to connect MongoDB', error.message);
        process.exit(1);
    }
};
