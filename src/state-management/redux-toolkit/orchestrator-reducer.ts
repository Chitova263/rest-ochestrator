import { createReducer } from '@reduxjs/toolkit';
import { orchestratorActions, OrchestratorActionType } from './orchestrator-actions';
import { TaskStoreState } from '../contracts';

function createOrchestratorReducer<TName extends string>(initialState: TaskStoreState<TName>, actions: OrchestratorActionType<TName>) {
    return createReducer(initialState, (builder) => {
        builder.addCase(actions.queue, (state, action) => {
            return {
                ...state,
                queue: action.payload.queue,
            };
        });
    });
}

export type OrchestratorReducerType = ReturnType<typeof createOrchestratorReducer>;

export const orchestratorReducer: OrchestratorReducerType = createOrchestratorReducer({ queue: [] }, orchestratorActions);
