import { TaskConfiguration } from "./contracts";
import { runDependencyConfiguration } from "./runDependencyConfiguration";
import {Task} from "./index";

export const bootstrapDependencyConfiguration: TaskConfiguration<Task> = {
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
