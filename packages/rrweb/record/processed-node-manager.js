export default class ProcessedNodeManager {
    constructor() {
        this.nodeMap = new WeakMap();
        this.loop = true;
        this.periodicallyClear();
    }
    periodicallyClear() {
        requestAnimationFrame(() => {
            this.clear();
            if (this.loop)
                this.periodicallyClear();
        });
    }
    inOtherBuffer(node, thisBuffer) {
        const buffers = this.nodeMap.get(node);
        return (buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer));
    }
    add(node, buffer) {
        this.nodeMap.set(node, (this.nodeMap.get(node) || new Set()).add(buffer));
    }
    clear() {
        this.nodeMap = new WeakMap();
    }
    destroy() {
        this.loop = false;
    }
}
