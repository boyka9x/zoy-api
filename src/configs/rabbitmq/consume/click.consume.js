import { ClickService } from "../../../services/index.js";

export const handleSaveClick = async (channel, message) => {
    try {
        const { pageview, points } = JSON.parse(message.content.toString());

        const pointMap = new Map();
        for (const point of points) {
            const key = `${point.x}-${point.y}-${point.query}-${point?.type || ''}`;
            const currentPoint = pointMap.get(key);
            if (currentPoint) {
                currentPoint.counts += 1;
            } else {
                pointMap.set(key, {
                    ...point,
                    counts: 1,
                    pageview: pageview._id,
                });
            }
        }

        const groupPoints = Array.from(pointMap.values());

        if (groupPoints.length) {
            await ClickService.bulkUpsert(groupPoints);
        }

        channel.ack(message);
    } catch (error) {
        console.error('Error processing message:', error);
        channel.nack(message);
    }
}