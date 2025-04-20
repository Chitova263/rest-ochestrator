export interface TaskConfiguration<Task extends string> {
    name: Task;
    tasks: TaskConfiguration<Task>[];
    dependsOn: Task[];
}

export type RunnableStatus = 'Pending' | 'Running' | "Success" | 'Failure' | 'Skipped';

export interface RunnableTaskConfiguration<Task extends string> {
    name: Task;
    tasks: RunnableTaskConfiguration<Task>[];
    dependsOn: Task[];
    status: RunnableStatus;
    startTime: number | null;
    endTime: number | null;
}

export interface TaskManager<Task extends string> {
    getRunnableTask(task: Task): RunnableTaskConfiguration<Task>;
    getAllRunnableTasks(): RunnableTaskConfiguration<Task>[];
    updateRunnableStatus(task: Task, status: RunnableStatus): void;
}

export abstract class AbstractTaskStateManager<Task extends string> implements TaskManager<Task> {

    public abstract getRunnableTask(task: Task): RunnableTaskConfiguration<Task>;
    public abstract getAllRunnableTasks(): RunnableTaskConfiguration<Task>[];
    public abstract updateRunnableStatus(task: Task, status: RunnableStatus): void;

    protected getRunnableTaskConfigurationFromTaskConfiguration<Task extends string>(config: TaskConfiguration<Task>): RunnableTaskConfiguration<Task> {
        return {
            name: config.name,
            status: "Pending",
            startTime: null,
            endTime: null,
            dependsOn: config.dependsOn,
            tasks: config.tasks.map((task: TaskConfiguration<Task>): RunnableTaskConfiguration<Task> => this.getRunnableTaskConfigurationFromTaskConfiguration(task) ),
        }
    }
}
