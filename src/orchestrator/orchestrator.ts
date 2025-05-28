import { TaskConfiguration } from '../core/contracts';
import { AbstractTaskStore, Status, Task } from '../state-management/contracts';
import { v4 as uuid } from 'uuid';

export class Orchestrator<TName extends string> {
    constructor(private readonly store: AbstractTaskStore<TName>) {
        this.initSchedular();
    }

    public enqueue(configuration: TaskConfiguration<TName>): void {
        this.store.enqueue(configuration);
        const newTask: Task<TName> = this.mapConfigurationToTask(configuration);
        const updatedQueue: Task<TName>[] = [...this.getCurrentQueue(), newTask];
        this.updatePendingIndependentQueuedTasksToReadyState(updatedQueue);
        this.handleQueue();
    }

    public complete(name: TName, status: Status): void {
        this.store.complete(name, status);
    }

    private getCurrentQueue(): Task<TName>[] {
        return this.store.getState().queue;
    }

    private updatePendingIndependentQueuedTasksToReadyState(tasks: Task<TName>[]): Task<TName>[] {
        /*
         * A task is ready if any of the conditions are met
         * 1. If it has an empty runAfter array
         * 2. If all names of the tasks in its runAfter array are completed with status SUCCESS or FAILURE
         * */
        const taskMap = new Map<TName, Task<TName>>();
        this.collectAllTasks(tasks, taskMap);
        this.updateTaskStatuses(tasks, taskMap);
        this.store.setQueue(tasks);
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
                    task.waitFor.length === 0 ||
                    task.waitFor.every((depName) => {
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

    private handleQueue(): void {
        this.updatePendingIndependentQueuedTasksToReadyState(this.getCurrentQueue());
        const readyTasks: Task<TName>[] = this.getFlattenTasks(this.getCurrentQueue()).filter(
            (task: Task<TName>): boolean => task.status === 'READY'
        );

        for (const task of readyTasks) {
            // Mark the task as starting here
            this.store.start(task.name);
        }
    }

    private getFlattenTasks(tasks: Task<TName>[]): Task<TName>[] {
        const flattenedTasks: Task<TName>[] = [];
        for (const task of tasks) {
            flattenedTasks.push(task);
            if (task.type === 'CONFIGURATION') {
                flattenedTasks.push(...this.getFlattenTasks(task.tasks));
            }
        }
        return flattenedTasks;
    }

    private mapConfigurationToTask(configuration: TaskConfiguration<TName>): Task<TName> {
        return {
            id: uuid(),
            name: configuration.name,
            status: 'PENDING',
            startTime: null,
            endTime: null,
            waitFor: configuration.dependsOn,
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
        // this.schedular.on('success', ({ name }): void => {
        //     const updatedQueue: Task<TName>[] = this.completeTasks(name, this.store.getState().queue, 'SUCCESS');
        //     this.store.completeTask(name, 'SUCCESS', updatedQueue);
        //     this.handleQueue();
        // });
        //
        // this.schedular.on('failure', ({ name }): void => {
        //     const updatedQueue: Task<TName>[] = this.completeTasks(name, this.store.getState().queue, 'SUCCESS');
        //     this.store.setQueue(updatedQueue);
        //     this.handleQueue();
        // });
    }
}
