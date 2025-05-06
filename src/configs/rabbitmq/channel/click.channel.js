import { handleSaveClick } from "../consume/click.consume";

export const ClickChannel = (() => {
    let channel;

    const init = async (conn) => {
        try {
            channel = await conn.createChannel();

            await channel.assertQueue('click', { durable: true });

            channel.prefetch(1, false);
            channel.consume('click', (message) => handleSaveClick(channel, message));
        } catch (error) {
            console.log(error);
        }
    }

    const publish = (message) => {
        channel.sendToQueue('click', Buffer.from(JSON.stringify(message)), { persistent: true });
    }

    return {
        init,
        publish,
    };
})();