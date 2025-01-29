export interface DependencyConfiguration {
    name: Task;
    tasks: DependencyConfiguration[];
    dependsOn: Task[]
}

export type Task =
    | 'bootstrap-application'
    | 'get-application-version'
    | 'get-feature-toggles'
    | 'get-application-config'
    | 'start-authentication'
