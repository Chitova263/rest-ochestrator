import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status, Task, TaskStore, TaskStoreState } from '../contracts';

export class ReduxToolkitTaskStoreAdapter<TName extends string> implements TaskStore<TName> {
    public constructor(
        private readonly store: StoreType,
        private readonly slice: StoreSliceType
    ) {}

    public getState(): TaskStoreState<TName> {
        return structuredClone(this.store.getState()['orchestrator']) as TaskStoreState<TName>;
    }

    public setQueue(queue: Task<TName>[]): void {
        this.store.dispatch(this.slice.actions.queue({ queue }));
    }
}

export function createStoreSlice<TName extends string>(initialState: TaskStoreState<TName>) {
    return createSlice({
        name: 'queue',
        initialState,
        reducers: {
            queue: (state, action: PayloadAction<{ queue: Task<TName>[] }>) => {
                return {
                    ...state,
                    queue: action.payload.queue,
                };
            },
        },
    });
}

export function createStore(slice: StoreSliceType, name: string) {
    return configureStore({
        reducer: {
            [name]: slice.reducer,
        },
    });
}

export type StoreSliceType = ReturnType<typeof createStoreSlice>;
export type StoreType = ReturnType<typeof createStore>;
