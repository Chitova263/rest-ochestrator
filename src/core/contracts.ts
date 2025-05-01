interface TaskGroup<T extends string> {
    name: T;
    steps: TaskConfiguration<T>[];
    dependsOn: T[];
}

interface TaskStep<T extends string> {
    name: T;
    dependsOn: T[];
}

export type TaskConfiguration<T extends string> = TaskGroup<T> | TaskStep<T>;
