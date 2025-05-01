import { Task, TaskStore } from '../contracts';

class ReduxToolkitTaskStoreAdapter<T extends string> implements TaskStore<T> {
    constructor(
        private readonly getStateFn: () => Task<T>[],
        private readonly dispatch: (action: any) => void
    ) {}

    getState(): Task<T>[] {
        return this.getStateFn();
    }

    setState(tasks: Task<T>[]): void {
        this.dispatch({ type: 'task/setTasks', payload: tasks });
    }
}
