import { DependencyConfiguration } from "./contracts";
import { runDependencyConfiguration } from "./runDependencyConfiguration";

export const bootstrapDependencyConfiguration: DependencyConfiguration = {
    name: 'a',
    tasks: [
        {
            name: 'b',
            dependsOn: [],
            tasks: []
        },
        {
            name: 'c',
            dependsOn: [],
            tasks: [runDependencyConfiguration]
        },
        {
            name: 'd',
            dependsOn: ['e', 'f'],
            tasks: []
        },
        {
            name: 'f',
            dependsOn: ['g'],
            tasks: []
        },
    ],
    dependsOn: [],
};
