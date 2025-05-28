import { SchedularEvent, SchedulerEventEmitter } from './schedular-event-emitter';

export class Scheduler<T extends string> {
    private readonly emitter: SchedulerEventEmitter<SchedularEvent<T>> = new SchedulerEventEmitter<SchedularEvent<T>>();

    public constructor() {}

    public emit<K extends keyof SchedularEvent<T>>(event: K, name: T) {
        this.emitter.emit(event, { name });
    }

    public on<K extends keyof SchedularEvent<T>>(event: K, listener: (payload: SchedularEvent<T>[K]) => void): void {
        this.emitter.on(event, listener);
    }

    public off<K extends keyof SchedularEvent<T>>(event: K, listener: (payload: SchedularEvent<T>[K]) => void): void {
        this.emitter.off(event, listener);
    }
}
