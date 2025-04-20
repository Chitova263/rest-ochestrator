import { TaskConfiguration } from "./contracts";
import {Task} from "./index";

export const runDependencyConfiguration: TaskConfiguration<Task> = {
    name: 'i',
    tasks: [
        {
            name: 'j',
            dependsOn: ['k'],
            tasks: []
        },
        {
            name: 'k',
            dependsOn: [],
            tasks: []
        },
    ],
    dependsOn: [],
};
