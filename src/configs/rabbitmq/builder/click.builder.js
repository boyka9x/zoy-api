import { SnapshotHelper } from "../../../helpers/index.js";
import { PageviewService } from "../../../services/index.js";
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
};