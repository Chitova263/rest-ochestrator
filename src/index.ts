import { TaskConfiguration } from './core/contracts';
import { Scheduler } from './scheduler/scheduler';
import { StateManager } from './state-management/state-manager';
import { reduxToolKitStoreAdapter } from './state-management/redux-toolkit/redux-toolkit-store';

const config: TaskConfiguration<string> = {
    name: 'main',
    steps: [
        { name: 'init', dependsOn: ['main'] },
        { name: 'load', dependsOn: ['init'] },
        { name: 'report', dependsOn: ['load'] },
    ],
    dependsOn: [],
};

const scheduler = new Scheduler();
const manager = new StateManager(reduxToolKitStoreAdapter, scheduler);

scheduler.on('start', ({ name }): void => {
    console.log(`started ${name}`);
    // Do some asynchronous work and dispatch a success event when completed
    scheduler.emit('success', name);
});

manager.enqueue(config);
