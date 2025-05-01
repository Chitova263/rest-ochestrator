import { ExecutableTask, Task } from './state-management/contracts';
import { z } from 'zod';
import { InMemoryStateManager } from './state-management/in-memory/inMemoryStateManager';
import { Scheduler } from './scheduler/scheduler';



const config: Task<string> = {
    name: 'main',
    dependsOn: [],
    tasks: [
        { name: 'init', dependsOn: ['main'], tasks: [] },
        { name: 'load', dependsOn: ['init'], tasks: [] },
        { name: 'report', dependsOn: ['load'], tasks: [] },
    ],
};

const scheduler = new Scheduler();
const manager = new InMemoryStateManager(scheduler);

scheduler.on('start', ({ name }): void => {
    console.log(`started ${name}`);
    // Do some work and emit success after complete
    scheduler.emit('success', name);
});

scheduler.on('success', ({ name }): void => {
    // Do something on success example logging
    console.log(`success ${name}`);
});

scheduler.on('failure', ({ name }): void => {
    // Do something on failure example logging
    console.log(`failure ${name}`);
});

manager.enqueue(config);
