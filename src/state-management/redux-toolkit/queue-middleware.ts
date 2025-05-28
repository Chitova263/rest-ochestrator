import { orchestratorActions } from './orchestrator-actions';

import { MiddlewareAPI, Dispatch } from '@reduxjs/toolkit';

// Utility type to extract return types of all action creators in orchestratorActions
type ActionsUnion<A extends { [key: string]: (...args: any[]) => any }> = ReturnType<A[keyof A]>;

export type OrchestratorAction = ActionsUnion<typeof orchestratorActions>;

export const queueMiddleware =
    (store: MiddlewareAPI<Dispatch<OrchestratorAction>, any>) => (next: Dispatch<OrchestratorAction>) => (action: OrchestratorAction) => {
        if (action.type === orchestratorActions.enqueue.type) {
            // console.log('enqueue action', action.payload);
            // const result = next(action); // Pass the action to the next middleware or reducer
            // console.log('Next state:', store.getState());
            // return result;
        }

        if (action.type === orchestratorActions.start.type && (action.payload as any).name === 'main') {
            const result = next(action);
            store.dispatch(orchestratorActions.complete({ name: 'main', status: 'SUCCESS' }));
            return result;
        }

        if (action.type === orchestratorActions.complete.type && (action.payload as any).name === 'main') {
            const result = next(action);
            console.log('SUCCESS', result);
            return result;
        }

        return next(action);
    };
