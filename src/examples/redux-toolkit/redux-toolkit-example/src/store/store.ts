import { configureStore } from '@reduxjs/toolkit';
import { queueMiddleware } from '../../../../../state-management/redux-toolkit/queue-middleware.ts';
import { Orchestrator } from '../../../../../orchestrator/orchestrator.ts';
import { ReduxOrchestratorAdapter } from '../../../../../state-management/redux-toolkit/redux-adapter.ts';
import { orchestratorReducer } from '../../../../../state-management/redux-toolkit/orchestrator-reducer.ts';

export const store = configureStore({
    reducer: {
        orchestrator: orchestratorReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(queueMiddleware as any),
});

const adapter = new ReduxOrchestratorAdapter(store);
export const orchestrator = new Orchestrator(adapter);
