import { TaskConfiguration } from '../core/contracts';
import { randomUUID } from 'node:crypto';
import { Scheduler } from '../scheduler/scheduler';
import { Status, Task, TaskStore } from './contracts';

export class StateManager<TName extends string> {
    constructor(
        private readonly store: TaskStore<TName>,
        private readonly scheduler: Scheduler<TName>
    ) {
        this.initSchedular();
    }

    public enqueue(configuration: TaskConfiguration<TName>): void {
        //Find tasks that are in PENDING state but are now READY and update queue state
        const tasks: Task<TName>[] = [...this.store.getState().queue, this.mapConfigurationToTask(configuration)];
        const updatedTasks: Task<TName>[] = this.setPendingIndependentTasksToReadyState(tasks);
        this.store.setQueue(updatedTasks);
        this.startScheduler();
    }

    private setPendingIndependentTasksToReadyState(tasks: Task<TName>[]): Task<TName>[] {
        /*
         * A task is ready if any of the conditions are met
         * 1. If it has an empty runAfter array
         * 2. If all names of the tasks in its runAfter array are completed with status SUCCESS or FAILURE
         * */
        const taskMap = new Map<TName, Task<TName>>();
        this.collectAllTasks(tasks, taskMap);
        this.updateTaskStatuses(tasks, taskMap);
        return tasks;
    }

    private collectAllTasks(taskList: Task<TName>[], taskMap: Map<TName, Task<TName>>): void {
        for (const task of taskList) {
            taskMap.set(task.name, task);
            if (task.tasks.length > 0) {
                this.collectAllTasks(task.tasks, taskMap);
            }
        }
    }

    private updateTaskStatuses(taskList: Task<TName>[], taskMap: Map<TName, Task<TName>>): void {
        for (const task of taskList) {
            if (task.status === 'PENDING') {
                const isReady =
                    task.runAfter.length === 0 ||
                    task.runAfter.every((depName) => {
                        const dep = taskMap.get(depName);
                        return dep && (dep.status === 'SUCCESS' || dep.status === 'FAILURE');
                    });

                if (isReady) {
                    task.status = 'READY';
                }
            }

            if (task.tasks.length > 0) {
                this.updateTaskStatuses(task.tasks, taskMap);
            }
        }
    }

    private startScheduler(): void {
        this.store.setQueue(this.setPendingIndependentTasksToReadyState(this.store.getState().queue));
        const cloned: Task<TName>[] = structuredClone(this.store.getState().queue);
        const flattenedTasks: Task<TName>[] = this.flattenTasks(cloned);
        const readyTasks: Task<TName>[] = flattenedTasks.filter((task: Task<TName>): boolean => task.status === 'READY');
        // Dispatch all the ready tasks in parallel
        for (const task of readyTasks) {
            this.scheduler.emit('start', task.name);
        }
    }

    private flattenTasks(tasks: Task<TName>[]): Task<TName>[] {
        const flattenedTasks: Task<TName>[] = [];
        for (const task of tasks) {
            flattenedTasks.push(task);
            if (task.type === 'CONFIGURATION') {
                flattenedTasks.push(...this.flattenTasks(task.tasks));
            }
        }
        return flattenedTasks;
    }

    private mapConfigurationToTask(configuration: TaskConfiguration<TName>): Task<TName> {
        return {
            id: randomUUID(),
            name: configuration.name,
            status: 'PENDING',
            startTime: null,
            endTime: null,
            runAfter: configuration.dependsOn,
            type: 'steps' in configuration ? 'CONFIGURATION' : 'EXECUTABLE',
            tasks: this.getTasks(configuration),
        };
    }

    private getTasks(configuration: TaskConfiguration<TName>): Task<TName>[] {
        return 'steps' in configuration
            ? configuration.steps.map((childTask: TaskConfiguration<TName>): Task<TName> => this.mapConfigurationToTask(childTask))
            : [];
    }

    private completeTasks(name: TName, tasks: Task<TName>[], status: Status): Task<TName>[] {
        for (const task of tasks) {
            if (task.name === name) {
                task.status = status;
                task.endTime = Date.now();
            }
            this.completeTasks(name, task.tasks, status);
        }
        return tasks;
    }

    private initSchedular(): void {
        this.scheduler.on('success', ({ name }): void => {
            const updatedQueue: Task<TName>[] = this.completeTasks(name, this.store.getState().queue, 'SUCCESS');
            this.store.setQueue(updatedQueue);
            this.startScheduler();
        });

        this.scheduler.on('failure', ({ name }): void => {
            const updatedQueue: Task<TName>[] = this.completeTasks(name, this.store.getState().queue, 'SUCCESS');
            this.store.setQueue(updatedQueue);
            this.startScheduler();
        });
    }
}
