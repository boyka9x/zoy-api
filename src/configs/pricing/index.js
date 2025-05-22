import { PricingModel } from "../../models/index.js";

export const PricingConfig = {
    init: async () => {
        try {
            const count = await PricingModel.countDocuments();
            if (count > 0) {
                console.log('Pricing plans already initialized.');
                return;
            }

            const defaultPlans = [
                {
                    title: 'Free',
                    code: 'free',
                    price: 0,
                    session_limit: 400,
                },
                {
                    title: 'Basic',
                    code: 'basic',
                    price: 19,
                    session_limit: 3000,
                },
                {
                    title: 'Enterprise',
                    code: 'enterprise',
                    price: 100,
                    session_limit: 10000,
                },
            ];

            await PricingModel.insertMany(defaultPlans);
            console.log('Default pricing plans initialized.');
        } catch (error) {
            console.error('Error initializing pricing plans:', error);
        }
    }
}