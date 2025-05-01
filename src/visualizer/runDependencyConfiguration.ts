import { TaskConfiguration } from '../core/contracts';
import { Tasks } from './visualizer';

export const runDependencyConfiguration: TaskConfiguration<Tasks> = {
    name: 'i',
    steps: [
        {
            name: 'j',
            runAfter: ['k'],
            steps: [],
        },
        {
            name: 'k',
            runAfter: [],
            steps: [],
        },
    ],
    runAfter: [],
};
