import { RunnableTaskConfiguration, TaskConfiguration} from "../contracts";

export function getRunnableTaskConfiguration<T extends string>(config: TaskConfiguration<T>): RunnableTaskConfiguration<T> {
    return {
        name: config.name,
        status: "Pending",
        startTime: null,
        endTime: null,
        dependsOn: config.dependsOn,
        tasks: config.tasks.map((task: TaskConfiguration<T>): RunnableTaskConfiguration<T> => getRunnableTaskConfiguration(task) ),
    }
}

export function getFlattenedRunnableTasks<Task extends string>(config: RunnableTaskConfiguration<Task>): Map<Task, RunnableTaskConfiguration<Task>> {
    const flattenedTaskConfigurationMapping = new Map<Task, RunnableTaskConfiguration<Task>>();

    function getFlattenedTaskConfigurationMapping(task: RunnableTaskConfiguration<Task>) {
        if (!flattenedTaskConfigurationMapping.has(task.name)) {
            flattenedTaskConfigurationMapping.set(task.name, {
                ...task
            });
        }
        for (const child of task.tasks) {
            getFlattenedTaskConfigurationMapping(child);
        }
    }

    getFlattenedTaskConfigurationMapping(config);
    return flattenedTaskConfigurationMapping;
}

