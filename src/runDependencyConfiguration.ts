import { DependencyConfiguration } from "./contracts";

export const runDependencyConfiguration: DependencyConfiguration = {
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
