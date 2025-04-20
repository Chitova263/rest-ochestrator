import {RunnableStatus, TaskManager, RunnableTaskConfiguration } from "../contracts";
import {SchedularEvent, SchedulerEventEmitter} from "./schedular-event-emitter";

export class Scheduler<Task extends string>{

    private readonly flattenedRunnableTasks: RunnableTaskConfiguration<Task>[] = [];
    private readonly completeRunnableTaskStatus: RunnableStatus[] = ['Failure', 'Skipped', 'Success'] as const;
    private readonly emitter: SchedulerEventEmitter<SchedularEvent<Task>> = new SchedulerEventEmitter<SchedularEvent<Task>>();

    public constructor(private readonly stateManager: TaskManager<Task>) {
        this.flattenedRunnableTasks = this.getFlattenedRunnableTasks(stateManager.getAllRunnableTasks()[0]);
    }

    public start(): void {
        while (this.getCompletedTasks().length < this.flattenedRunnableTasks.length) {
            // Find the tasks that are ready to run
            const executables: RunnableTaskConfiguration<Task>[] = [];
            for (const currentRunnableTask of this.flattenedRunnableTasks) {
                // Task must be in pending state
                if(currentRunnableTask.status !== 'Pending') {
                    continue;
                };
                // If task has all dependencies that are Complete it is ready to execute
                const hasAllDependenciesComplete: boolean = currentRunnableTask.dependsOn.every(task => {
                    const runnable: RunnableTaskConfiguration<Task> | undefined = this.flattenedRunnableTasks.find((runnable) => runnable.name === task);
                    if(!runnable) {
                        throw new Error('Dependencies not found');
                    }
                    return this.completeRunnableTaskStatus.includes(runnable.status)
                })
                if(hasAllDependenciesComplete) {
                    executables.push(currentRunnableTask);
                }
            }

            if (executables.length === 0) {
                // TODO: Topological sort on configuration to detect cycles
                throw new Error("Cyclic dependency or unresolved task state.");
            }

            // Execute all the ready tasks in parallel and wait until execution is complete
            // Mark the tasks as started and dispatch a start event for the task
            // TODO: Create an event dispatcher
            for (const executable of executables) {
                const state: RunnableTaskConfiguration<Task> | undefined = this.flattenedRunnableTasks.find(task => task.name === executable.name);
                if(!state) {
                    throw new Error(`Unable to find task "${executable.name}"`);
                }

                this.emitter.emit('onStart', { name: executable.name });
                this.stateManager.updateRunnableStatus(executable.name, 'Running');
            }
            // Wait for all running tasks to complete before scheduling the next cycle

        }
    }

    public on<K extends keyof SchedularEvent<Task>>(event: K, listener: (payload: SchedularEvent<Task>[K]) => void): void {
        this.emitter.on(event, listener);
    }

    public off<K extends keyof SchedularEvent<Task>>(event: K, listener: (payload: SchedularEvent<Task>[K]) => void): void {
        this.emitter.off(event, listener);
    }

    private getFlattenedRunnableTasks<Task extends string>(runnableTaskConfiguration: RunnableTaskConfiguration<Task>): RunnableTaskConfiguration<Task>[] {
        const flattenedTaskConfigurationMapping = new Map<Task, RunnableTaskConfiguration<Task>>();

        function getFlattenedTaskConfigurationMapping(task: RunnableTaskConfiguration<Task>) {
            if (!flattenedTaskConfigurationMapping.has(task.name)) {
                flattenedTaskConfigurationMapping.set(task.name, task);
            }
            for (const child of task.tasks) {
                getFlattenedTaskConfigurationMapping(child);
            }
        }

        getFlattenedTaskConfigurationMapping(runnableTaskConfiguration);
        return [...flattenedTaskConfigurationMapping.values()];
    }

    private getCompletedTasks(): RunnableTaskConfiguration<Task>[] {
        const completedTasks: RunnableTaskConfiguration<Task>[] = [];
        for (const task of this.flattenedRunnableTasks) {
            if (this.completeRunnableTaskStatus.includes(task.status)) {
                completedTasks.push(task);
            }
        }
        return completedTasks;
    }
}