import { TaskConfiguration } from '../core/contracts';
import { randomUUID } from 'node:crypto';
import { Scheduler } from '../scheduler/scheduler';
import { Task, TaskStatus, TaskStore } from './contracts';

export class StateManager<T extends string> {
    constructor(
        private readonly store: TaskStore<T>,
        private readonly scheduler: Scheduler<T>
    ) {
        scheduler.on('success', ({ name }): void => {
            this.store.setState(this.completeTask(name, this.store.getState(), 'SUCCESS'));
            this.start();
        });

        scheduler.on('failure', ({ name }): void => {
            this.store.setState(this.completeTask(name, this.store.getState(), 'FAILURE'));
            this.start();
        });
    }

    public enqueue(configuration: TaskConfiguration<T>): void {
        const task: Task<T> = this.mapConfigurationToTask(configuration);

        const queue = this.store.getState();
        const newQueue: Task<T>[] = [...structuredClone(queue), task];
        //Find tasks that are in PENDING state but are now READY and update queue state
        this.store.setState(this.findPendingTasksThatAreReadyAndMarkAsReady(newQueue));
        this.start();
    }

    private findPendingTasksThatAreReadyAndMarkAsReady(tasks: Task<T>[]): Task<T>[] {
        /*
         * A task is ready if any of the conditions are met
         * 1. If it has an empty runAfter array
         * 2. If all names of the tasks in its runAfter array are completed with status SUCCESS or FAILURE
         * */
        const taskMap = new Map<T, Task<T>>();
        this.collectAllTasks(tasks, taskMap);
        this.updateTaskStatuses(tasks, taskMap);
        return tasks;
    }

    private collectAllTasks(taskList: Task<T>[], taskMap: Map<T, Task<T>>): void {
        for (const task of taskList) {
            taskMap.set(task.name, task);
            if (task.tasks.length > 0) {
                this.collectAllTasks(task.tasks, taskMap);
            }
        }
    }

    private updateTaskStatuses(taskList: Task<T>[], taskMap: Map<T, Task<T>>): void {
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

    private start(): void {
        this.store.setState(this.findPendingTasksThatAreReadyAndMarkAsReady(this.store.getState()));
        const cloned: Task<T>[] = structuredClone(this.store.getState());
        const flattenedTasks: Task<T>[] = this.flattenTasks(cloned);
        const readyTasks: Task<T>[] = flattenedTasks.filter((task: Task<T>): boolean => task.status === 'READY');
        // Dispatch all the ready tasks in parallel
        for (const task of readyTasks) {
            this.scheduler.emit('start', task.name);
        }
    }

    private flattenTasks(tasks: Task<T>[]): Task<T>[] {
        const flattenedTasks: Task<T>[] = [];
        for (const task of tasks) {
            flattenedTasks.push(task);
            if (task.kind === 'CONFIGURATION') {
                flattenedTasks.push(...this.flattenTasks(task.tasks));
            }
        }
        return flattenedTasks;
    }

    private mapConfigurationToTask(configuration: TaskConfiguration<T>): Task<T> {
        return {
            identifier: randomUUID(),
            name: configuration.name,
            status: 'PENDING',
            startedTime: null,
            endTime: null,
            runAfter: configuration.dependsOn,
            kind: 'steps' in configuration ? 'CONFIGURATION' : 'EXECUTABLE',
            tasks: this.getTasks(configuration),
        };
    }

    private getTasks(configuration: TaskConfiguration<T>): Task<T>[] {
        return 'steps' in configuration
            ? configuration.steps.map((childTask: TaskConfiguration<T>): Task<T> => this.mapConfigurationToTask(childTask))
            : [];
    }

    private completeTask(name: T, tasks: Task<T>[], status: TaskStatus): Task<T>[] {
        for (const task of tasks) {
            if (task.name === name) {
                task.status = status;
                task.endTime = Date.now();
            }
            this.completeTask(name, task.tasks, status);
        }
        return tasks;
    }
}
