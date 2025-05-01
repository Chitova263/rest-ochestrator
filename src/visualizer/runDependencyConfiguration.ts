import { Task } from '../state-management/contracts';
import {Tasks} from "./visualizer";

export const runDependencyConfiguration: Task<Tasks> = {
    name: 'i',
    tasks: [
        {
            name: 'j',
            dependsOn: ['k'],
            tasks: [],
        },
        {
            name: 'k',
            dependsOn: [],
            tasks: [],
        },
    ],
    dependsOn: [],
};
