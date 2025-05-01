import { TaskConfiguration } from '../core/contracts';
import { runDependencyConfiguration } from './runDependencyConfiguration';
import { Tasks } from './visualizer';

export const bootstrapDependencyConfiguration: TaskConfiguration<Tasks> = {
    name: 'a',
    steps: [
        {
            name: 'b',
            runAfter: [],
            steps: [],
        },
        {
            name: 'c',
            runAfter: [],
            steps: [runDependencyConfiguration],
        },
        {
            name: 'd',
            runAfter: ['e', 'f'],
            steps: [],
        },
        {
            name: 'f',
            runAfter: ['g'],
            steps: [],
        },
    ],
    runAfter: [],
};
