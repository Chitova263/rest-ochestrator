import { createAction } from '@reduxjs/toolkit';
import { TaskConfiguration } from '../../core/contracts';
import { Status, Task } from '../contracts';

export function orchestratorActionFactory<TName extends string>() {
    return {
        queue: createAction<{
            queue: Task<TName>[];
        }>(`[orchestrator] updated queue`),
        enqueue: createAction<{
            configuration: TaskConfiguration<string>;
        }>('[orchestrator] enqueue configuration'),
        complete: createAction<{
            name: string;
            status: Status;
        }>('[orchestrator] complete task'),
        start: createAction<{
            name: TName;
        }>(`[orchestrator] start task`),
    };
}

export type OrchestratorActionType<TName extends string> = ReturnType<typeof orchestratorActionFactory<TName>>;
export const orchestratorActions = orchestratorActionFactory();
