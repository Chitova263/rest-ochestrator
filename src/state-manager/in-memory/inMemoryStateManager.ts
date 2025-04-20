import {
    AbstractTaskStateManager,
    RunnableStatus,
    RunnableTaskConfiguration,
    TaskConfiguration
} from "../../contracts";

export class InMemoryStateManager<Task extends string> extends AbstractTaskStateManager<Task> {

    private readonly queue: RunnableTaskConfiguration<Task>[] = [];

    public getRunnableTask(task: Task): RunnableTaskConfiguration<Task> {
        throw new Error("Method not implemented.");
    }

    public getAllRunnableTasks(): RunnableTaskConfiguration<Task>[] {
       return this.queue;
    }

    public updateRunnableStatus(task: Task, status: RunnableStatus): void {
        const flattened: Map<Task, RunnableTaskConfiguration<Task>> = this.getFlattenedRunnableTasks(this.queue[0]);
        const runnableTaskConfiguration: RunnableTaskConfiguration<Task> | undefined = flattened.get(task);
        if(!runnableTaskConfiguration){
           throw new Error('Could not find runnable task.');
        }
        runnableTaskConfiguration.status = status;
        const completeRunnableStatus: RunnableStatus[] = ['Success', 'Failure', 'Skipped'];
        if(completeRunnableStatus.includes(status)){
            runnableTaskConfiguration.endTime = new Date().getTime();
        }
        if(status === 'Running') {
            runnableTaskConfiguration.startTime = new Date().getTime();
        }
        console.log(`Runnable Task Updated: ${runnableTaskConfiguration.name}, status: ${runnableTaskConfiguration.status}`);
    }

    public enqueueTaskConfiguration(configuration: TaskConfiguration<Task>): void {
        const runnableTaskConfiguration: RunnableTaskConfiguration<Task> = this.getRunnableTaskConfigurationFromTaskConfiguration(configuration);
        this.queue.push(runnableTaskConfiguration);
    }

    private getFlattenedRunnableTasks<Task extends string>(config: RunnableTaskConfiguration<Task>): Map<Task, RunnableTaskConfiguration<Task>> {
        const flattenedTaskConfigurationMapping = new Map<Task, RunnableTaskConfiguration<Task>>();
        function getFlattenedTaskConfigurationMapping(task: RunnableTaskConfiguration<Task>) {
            if (!flattenedTaskConfigurationMapping.has(task.name)) {
                flattenedTaskConfigurationMapping.set(task.name, task);
            }
            for (const child of task.tasks) {
                getFlattenedTaskConfigurationMapping(child);
            }
        }
        getFlattenedTaskConfigurationMapping(config);
        return flattenedTaskConfigurationMapping;
    }
}