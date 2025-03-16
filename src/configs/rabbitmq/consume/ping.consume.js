import { Logger } from "../../../helpers";

export const handlePingConsume = async (channel, domain, message) => {
    try {
        if (message === null) {
            Logger.info(__filename, domain, 'Invalid message');
            return;
        }

        const data = JSON.parse(message.content.toString());

        console.log(data);


        channel.ack(message);
    } catch (e) {
        Logger.error(__filename, domain, e);
        channel.ack(message);
    }
};

