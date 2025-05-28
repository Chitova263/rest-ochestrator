import { Action } from '@reduxjs/toolkit';
import { orchestratorActions } from './orchestrator-actions';
import { TaskConfiguration } from '../../core/contracts';
import { AbstractTaskStore, Status, Task, TaskStoreState } from '../contracts';

export class ReduxOrchestratorAdapter<TName extends string, TState extends TaskStoreState<TName>> extends AbstractTaskStore<TName> {
    public constructor(
        private readonly store: { getState: () => { [p: string]: TState }; dispatch: (action: Action) => void },
        private readonly namespace: string = 'orchestrator'
    ) {
        super();
    }

    public complete(name: TName, status: Status): void {
        this.store.dispatch(orchestratorActions.complete({ name, status }));
    }

    public getState(): TState {
        return structuredClone(this.store.getState()[this.namespace]);
    }

    public setQueue(queue: Task<TName>[]): void {
        this.store.dispatch(orchestratorActions.queue({ queue }));
    }

    public enqueue(configuration: TaskConfiguration<TName>): void {
        this.store.dispatch(orchestratorActions.enqueue({ configuration }));
    }

    public start(name: TName): void {
        this.store.dispatch(orchestratorActions.start({ name }));
    }
}
