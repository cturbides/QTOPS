type EventHandler<T> = (payload: T) => Promise<void> | void;

// Declaration merging will extend this
export interface EventPayloads {
    placeholderEvent: { message: string };
}

class EventBus {
    private handlers: {
        [K in keyof EventPayloads]?: EventHandler<EventPayloads[K]>[]
    } = {};

    /**
     * Registers an event handler for a specific event type.
     * @param event - The event type to listen for.
     * @param handler - The handler function to execute when the event is emitted.
     */
    on<K extends keyof EventPayloads>(event: K, handler: EventHandler<EventPayloads[K]>): void {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }

        this.handlers[event]!.push(handler);
    }

    /**
     * Emits an event, triggering all registered handlers for that event type.
     * @param event - The event type to emit.
     * @param payload - The data to pass to the event handlers.
     */
    async emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): Promise<void> {
        const eventHandlers = this.handlers[event] || [];
        for (const handler of eventHandlers) {
            await handler(payload);
        }
    }
}

export const eventBus = new EventBus();
