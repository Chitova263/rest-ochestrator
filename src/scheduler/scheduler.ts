import { ExecutableTask, StateManager } from '../state-management/contracts';
import { SchedularEvent, SchedulerEventEmitter } from './schedular-event-emitter';

export class Scheduler<ExecutableIdentifier extends string> {
    private readonly emitter: SchedulerEventEmitter<SchedularEvent<ExecutableIdentifier>> = new SchedulerEventEmitter<
        SchedularEvent<ExecutableIdentifier>
    >();

    public constructor() {}

    public run(stateManager: StateManager<ExecutableIdentifier>): void {
        const executables: ExecutableTask<ExecutableIdentifier>[] = stateManager.getAllFlattenedReadyExecutables();
        for (const executable of executables) {
            this.emit('start', executable.name);
        }
    }


    public emit<K extends keyof SchedularEvent<ExecutableIdentifier>>(event: K, name: ExecutableIdentifier) {
        this.emitter.emit(event, { name });
    }

    public on<K extends keyof SchedularEvent<ExecutableIdentifier>>(
        event: K,
        listener: (payload: SchedularEvent<ExecutableIdentifier>[K]) => void
    ): void {
        this.emitter.on(event, listener);
    }

    public off<K extends keyof SchedularEvent<ExecutableIdentifier>>(
        event: K,
        listener: (payload: SchedularEvent<ExecutableIdentifier>[K]) => void
    ): void {
        this.emitter.off(event, listener);
    }
}
