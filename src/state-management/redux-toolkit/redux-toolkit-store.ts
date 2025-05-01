import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStore } from '../contracts';

class ReduxToolkitTaskStoreAdapter<T extends string> implements TaskStore<T> {
    constructor(
        private readonly getStateFn: () => RootState,
        private readonly dispatch: AppDispatch
    ) {}

    public getState(): Task<T>[] {
        return this.getStateFn().orchestrator.queue;
    }

    public setState(tasks: Task<T>[]): void {
        this.dispatch({ type: 'enqueue tasks', payload: tasks });
    }
}

export interface State<T extends string> {
    queue: Task<T>[];
}

function getStoreSlice<T extends string>() {
    return createSlice({
        name: 'queue',
        initialState: {
            queue: [],
        },
        reducers: {
            queue: (state, action: PayloadAction<{ tasks: Task<T>[] }>) => {
                console.log(state, action);
            },
        },
    });
}

export const store = configureStore({
    reducer: {
        orchestrator: getStoreSlice().reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const reduxToolKitStoreAdapter = new ReduxToolkitTaskStoreAdapter(store.getState, store.dispatch);
