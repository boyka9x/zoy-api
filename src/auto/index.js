import schedule from 'node-schedule';
import { HeatmapAuto } from './heatmap.auto.js';
import { Logger } from '../helpers/logger.helper.js';

export const Auto = {
    init: async () => {
        try {
            schedule.scheduleJob('*/30 * * * *', HeatmapAuto.buildShop);

            Logger.info('index.js', 'Auto', 'Starting auto jobs...');
        } catch (error) {
            console.error('Auto', error.message);
        }
    }
}