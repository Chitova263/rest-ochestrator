import { TaskConfiguration } from '../core/contracts';

export type Status = 'PENDING' | 'READY' | 'SUCCESS' | 'FAILURE';

export type TaskType = 'CONFIGURATION' | 'EXECUTABLE';

export interface Task<TName extends string> {
    id: string;
    name: TName;
    tasks: Task<TName>[];
    waitFor: TName[];
    status: Status;
    startTime: number | null;
    endTime: number | null;
    type: TaskType;
}

export interface TaskStoreState<TName extends string> {
    queue: Task<TName>[];
}

export abstract class AbstractTaskStore<TName extends string> {
    abstract complete(name: TName, status: Status): void;
    abstract getState(): TaskStoreState<TName>;
    abstract setQueue(queue: Task<TName>[]): void;
    abstract enqueue(configuration: TaskConfiguration<TName>): void;
    abstract start(name: TName): void;
}
