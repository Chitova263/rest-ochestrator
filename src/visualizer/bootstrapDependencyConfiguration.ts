import { Task } from '../state-management/contracts';
import { runDependencyConfiguration } from './runDependencyConfiguration';
import {Tasks} from "./visualizer";

export const bootstrapDependencyConfiguration: Task<Tasks> = {
    name: 'a',
    tasks: [
        {
            name: 'b',
            dependsOn: [],
            tasks: [],
        },
        {
            name: 'c',
            dependsOn: [],
            tasks: [runDependencyConfiguration],
        },
        {
            name: 'd',
            dependsOn: ['e', 'f'],
            tasks: [],
        },
        {
            name: 'f',
            dependsOn: ['g'],
            tasks: [],
        },
    ],
    dependsOn: [],
};
