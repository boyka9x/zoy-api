import { handleSaveClick } from "../consume/click.consume.js";

export const ClickChannel = (() => {
    let channel;

    const initial = async (conn) => {
        try {
            channel = await conn.createChannel();

            await channel.assertQueue('click', { durable: true });

            channel.prefetch(1, false);
            channel.consume('click', (message) => handleSaveClick(channel, message));
        } catch (error) {
            console.log(error);
        }
    }

    const publish = async (message) => {
        channel.sendToQueue('click', Buffer.from(JSON.stringify(message)), { persistent: true });
    }

    return {
        initial,
        publish,
    };
})();