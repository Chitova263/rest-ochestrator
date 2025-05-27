export type Status = 'PENDING' | 'READY' | 'SUCCESS' | 'FAILURE';

export type TaskType = 'CONFIGURATION' | 'EXECUTABLE';

export interface Task<TName extends string> {
    id: string;
    name: TName;
    tasks: Task<TName>[];
    runAfter: TName[];
    status: Status;
    startTime: number | null;
    endTime: number | null;
    type: TaskType;
}

export interface TaskStore<TName extends string> {
    getState(): TaskStoreState<TName>;
    setQueue(queue: Task<TName>[]): void;
}

export interface TaskStoreState<TName extends string> {
    queue: Task<TName>[];
}
