import amqp from 'amqplib';
import { PingChannel } from './channel/ping.channel.js';
import { Logger } from '../../helpers/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export * from './channel/ping.channel.js';

export const initRabbit = async () => {
    try {
        const conn = await amqp.connect(process.env.AMQP_URI);
        await PingChannel.initial(conn);

        conn.on('error', function (err) {
            Logger.error(__filename, 'AMQP', err.message);
            setTimeout(initRabbit, 10000);
        });
        conn.on('close', function () {
            Logger.error(__filename, 'AMQP', 'Connect closed!');
            setTimeout(initRabbit, 10000);
        });

        Logger.info(__filename, 'AMQP', 'Connect OK!');
    } catch (error) {
        Logger.error(__filename, 'AMQP', error.message);
        setTimeout(initRabbit, 10000);
    }
}
