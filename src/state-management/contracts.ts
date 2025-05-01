import { UUID } from 'node:crypto';

export interface Task<TaskName extends string> {
    name: TaskName;
    tasks: Task<TaskName>[];
    dependsOn: TaskName[];
}

/**
 *  Represents the state of an {@link ExecutableTask} in the queue
 *
 * - **Pending**: Executable in the task queue but not ready to be processed (still has dependencies not yet complete).
 * - **Ready**: Executable in the task queue but ready to be processed (all dependencies completed).
 * - **Running**: Executable currently being processed.
 * - **Success**: Executable completed with reason success.
 * - **Failure**: Executable completed with reason failure.
 * - **Skipped**: Executable completed with reason skipped.
 */
export type ExecutableState = 'Pending' | 'Ready' | 'Running' | 'Success' | 'Failure';

export interface ExecutableTask<ExecutableName extends string> {
    identifier: UUID;
    name: ExecutableName;
    tasks: ExecutableTask<ExecutableName>[];
    dependsOn: ExecutableName[];
    state: ExecutableState;
    startTime: number | null;
    endTime: number | null;
}

export interface StateManager<ExecutableName extends string> {
    enqueue(config: Task<ExecutableName>): void;
    getAllExecutables(): ExecutableTask<ExecutableName>[];
    getAllFlattenedReadyExecutables(): ExecutableTask<ExecutableName>[];
}
