import { TaskConfiguration } from '../core/contracts';

export type TaskStatus = 'PENDING' | 'READY' | 'SUCCESS' | 'FAILURE';

export type TaskKind = 'CONFIGURATION' | 'EXECUTABLE';

export interface Task<T extends string> {
    identifier: string;
    name: T;
    tasks: Task<T>[];
    runAfter: T[];
    status: TaskStatus;
    startedTime: number | null;
    endTime: number | null;
    kind: TaskKind;
}

export interface StateManager<T extends string> {
    enqueue(config: TaskConfiguration<T>): void;
}

export interface TaskStore<T extends string> {
    getState(): Task<T>[];
    setState(tasks: Task<T>[]): void;
}
