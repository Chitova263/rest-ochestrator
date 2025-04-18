export interface TaskConfiguration<Task extends string> {
    name: Task;
    tasks: TaskConfiguration<Task>[];
    dependsOn: Task[];
}

export interface RunnableTaskConfiguration<Task extends string> {
    name: Task;
    tasks: RunnableTaskConfiguration<Task>[];
    dependsOn: Task[];
    status: 'Pending' | 'Running' | "Success" | 'Failure' | 'Skipped';
    startTime: number | null;
    endTime: number | null;
}
