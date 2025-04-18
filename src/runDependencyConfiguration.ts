import { TaskConfiguration } from "./contracts";

export const runDependencyConfiguration: TaskConfiguration = {
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
