import { DependencyConfiguration } from "./contracts";

export const bootstrapDependencyConfiguration: DependencyConfiguration = {
    name: 'bootstrap-application',
    tasks: [
        {
            name: 'get-application-version',
            dependsOn: [],
            tasks: []
        },
        {
            name: 'get-feature-toggles',
            dependsOn: [],
            tasks: []
        },
        {
            name: 'get-application-config',
            dependsOn: ['get-feature-toggles'],
            tasks: []
        },
        {
            name: 'start-authentication',
            dependsOn: ['get-application-config'],
            tasks: []
        },
    ],
    dependsOn: [],
};
