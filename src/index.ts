import { TaskConfiguration } from './core/contracts';
import { Scheduler } from './scheduler/scheduler';
import { StateManager } from './state-management/state-manager';
import {
    createStore,
    createStoreSlice,
    ReduxToolkitTaskStoreAdapter,
    StoreSliceType,
    StoreType,
} from './state-management/redux-toolkit/redux-toolkit-store';
import { TaskStoreState } from './state-management/contracts';

const config: TaskConfiguration<string> = {
    name: 'main',
    steps: [
        { name: 'init', dependsOn: ['main'] },
        { name: 'load', dependsOn: ['init'] },
        { name: 'report', dependsOn: ['load'] },
    ],
    dependsOn: [],
};

const initialState: TaskStoreState<string> = { queue: [] };
const slice: StoreSliceType = createStoreSlice(initialState);
const store: StoreType = createStore(slice, 'orchestrator');

store.subscribe(() => {
    console.log(JSON.stringify(store.getState(), null, 3));
});

export const reduxToolKitStoreAdapter = new ReduxToolkitTaskStoreAdapter(store, slice);

const scheduler = new Scheduler();
const manager = new StateManager(reduxToolKitStoreAdapter, scheduler);

scheduler.on('start', ({ name }): void => {
    console.log(`started ${name}`);
    // Do some asynchronous work and dispatch a success event when completed
    scheduler.emit('success', name);
});

manager.enqueue(config);
