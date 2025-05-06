import { SnapshotHelper } from "../../../helpers/index.js";
import { ClickService, PageviewService } from "../../../services/index.js";
import { EventBuilder } from "./event.builder.js";

export const initClickBuilder = ({ device, pageview }) => {
    const click = {
        type: 'click',
        points: [],
        pageview
    };

    const eventClick = {
        first: null,
        last: null,
    };

    const process = async (event, snapshot) => {
        const { data, timestamp } = event;

        let node = SnapshotHelper.searchNode(data.id, snapshot.data.node);
        if (!node) return;

        const selector = SnapshotHelper.getSelector(node, snapshot);
        if (!selector) return;

        const textContent = SnapshotHelper.getTextContent(node);

        const standard = EventBuilder.buildToStandardSize({ device, pageview, data });
        if (selector && textContent && standard) {
            const point = {
                x: standard.x,
                y: standard.y,
                selector,
                textContent,
                date: new Date(timestamp),
            };
            click.points.push(point);

            if (!eventClick.first && !pageview.hmTime) {
                eventClick.first = {
                    ...point,
                    type: 'first-click'
                };
            }

            eventClick.last = {
                ...point,
                type: 'last-click'
            };
        }

        if (click.points.length >= 100) {
            await PageviewService.updateOne({ _id: pageview._id }, { hmTime: timestamp });
            click.points = []
        }
    }

    const end = async () => {
        if (eventClick.first) {
            click.points.push(eventClick.first);
            eventClick.first = null;
        }

        if (eventClick.last) {
            await ClickService.deleteMany({ pageview: pageview._id, type: 'last-click' });
            click.points.push(eventClick.last);
            eventClick.last = null;
        }

        if (click.points.length) {
            click.points = [];
        }
    }

    const endRealtime = async () => {
        if (eventClick.first) {
            click.points.push(eventClick.first);
            eventClick.first = null;
        }

        if (eventClick.last) {
            await ClickService.deleteMany({ pageview: pageview._id, type: 'last-click' });
            click.points.push(eventClick.last);
            eventClick.last = null;
        }

        if (click.points.length) {
            const pointMap = new Map();
            for (const point of click.points) {
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
        }
    };


    return {
        process,
        end,
        endRealtime,
    }
};