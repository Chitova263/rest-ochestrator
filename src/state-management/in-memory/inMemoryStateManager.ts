import { ExecutableState, ExecutableTask, Task, StateManager } from '../contracts';
import { randomUUID } from 'node:crypto';
import { Scheduler } from '../../scheduler/scheduler';

export class InMemoryStateManager<ExecutableName extends string> implements StateManager<ExecutableName> {
    private queue: ExecutableTask<ExecutableName>[] = [];

    constructor(private readonly schedular: Scheduler<ExecutableName>) {}

    // the status of executables in the queue is updated everytime when we enqueue an executable or when an executable completes
    // the schedular is always triggered everytime we enqueue something to the queue or when an executable completes
    // TODO: State manager must communicate with the schedular somehow / but still must be decoupled, Must be event driven
    public enqueue(task: Task<ExecutableName>): void {
        // convert the task to be queued to an executable task
        const executable: ExecutableTask<ExecutableName> = InMemoryStateManager.convertToExecutableTask(task);
        // check which executable tasks are ready to execute, update status and add to the queue
        // NB: only works for single config added on startup of application
        const queue: ExecutableTask<ExecutableName>[] = [...this.queue, executable];

        // go through each executable in the queue marking tasks that are ready
        // currently just considering one item in the queue
        this.updateExecutableTaskThatAreReady(queue);

        this.queue = queue;

        // Start all ready plays
        this.schedular.run(this);
    }

    private updateExecutableTaskThatAreReady(queue: ExecutableTask<ExecutableName>[]) {
        for (const executable of queue) {
            // it is ready if all its depends on array is empty or the depends on executables are complete
            // check if it has all dependencies complete
            this.updateReadyExecutableTasks(executable);
        }
    }

    private updateReadyExecutableTasks(executable: ExecutableTask<ExecutableName>) {
        if (this.isDependsOnListEmpty(executable)) {
            executable.state = 'Ready';
        }
        for (const task of executable.tasks) {
            this.updateReadyExecutableTasks(task);
        }
    }

    private isDependsOnListEmpty(executable: ExecutableTask<ExecutableName>): boolean {
        return executable.dependsOn.length === 0;
    }

    public getAllExecutables(): ExecutableTask<ExecutableName>[] {
        return this.queue;
    }

    public getAllFlattenedExecutables(executables: ExecutableTask<ExecutableName>[]): ExecutableTask<ExecutableName>[] {
        return InMemoryStateManager.flatten(executables, []);
    }

    public getAllFlattenedPendingExecutables(executables: ExecutableTask<ExecutableName>[]): ExecutableTask<ExecutableName>[] {
        return this.getAllFlattenedExecutablesByState(executables, 'Pending');
    }

    public getAllFlattenedReadyExecutables(): ExecutableTask<ExecutableName>[] {
        const executables = this.getAllFlattenedExecutables(this.getAllExecutables());
        return this.getAllFlattenedExecutablesByState(executables, 'Ready');
    }

    public getAllFlattenedExecutablesByState(
        executables: ExecutableTask<ExecutableName>[],
        state: ExecutableState
    ): ExecutableTask<ExecutableName>[] {
        return executables.filter((executable: ExecutableTask<ExecutableName>): boolean => executable.state === state);
    }

    private static flatten<ExecutableIdentifier extends string>(
        executables: ExecutableTask<ExecutableIdentifier>[],
        flattenedExecutables: ExecutableTask<ExecutableIdentifier>[]
    ): ExecutableTask<ExecutableIdentifier>[] {
        for (const executable of executables) {
            flattenedExecutables.push(executable);
            if (executable.tasks.length > 0) {
                InMemoryStateManager.flatten(executable.tasks, flattenedExecutables);
            }
        }
        return flattenedExecutables;
    }

    private static convertToExecutableTask<ExecutableIdentifier extends string>(
        task: Task<ExecutableIdentifier>
    ): ExecutableTask<ExecutableIdentifier> {
        return {
            identifier: randomUUID(),
            name: task.name,
            state: 'Pending',
            startTime: null,
            endTime: null,
            dependsOn: task.dependsOn,
            tasks: task.tasks.map(
                (childTask: Task<ExecutableIdentifier>): ExecutableTask<ExecutableIdentifier> =>
                    InMemoryStateManager.convertToExecutableTask(childTask)
            ),
        };
    }
}
