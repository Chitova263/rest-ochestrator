import {RunnableStatus} from "../contracts";

export interface SchedularEvent<Task extends string> {
    onStart: { name: Task };
    onComplete: { name: Task };
}

export class SchedulerEventEmitter<Events extends Record<string, any>> {
    private listeners: {
        [K in keyof Events]?: Array<(payload: Events[K]) => void>;
    } = {};

    public on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }

    public off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
        this.listeners[event] = (this.listeners[event] || []).filter(l => l !== listener);
    }

    public emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        for (const listener of this.listeners[event] || []) {
            listener(payload);
        }
    }
}