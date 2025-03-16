import mongoose from "mongoose";

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,
            {
                ignoreUndefined: true,
            }
        );
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Failed to connect MongoDB', error.message);
        process.exit(1);
    }
};
