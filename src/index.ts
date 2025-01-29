import { bootstrapDependencyConfiguration } from "./bootstrapDependencyConfiguration";
import { DependencyConfiguration, Task } from "./contracts";




// 1. Convert dependency configuration to an adjacency list
// 2. Assert that graph is a DAG
// 3. Visualize using visualization tool

const adjacencyListRepresentation: Map<Task, Task[]> = new Map<Task, Task[]>();
function buildAdjacencyList(dependencyConfiguration: DependencyConfiguration) {
    const task: Task = dependencyConfiguration.name;
    const dependsOn: Task[] = dependencyConfiguration.dependsOn;
    if (!adjacencyListRepresentation.has(task)) {
        adjacencyListRepresentation.set(task, dependsOn);
    } else {
        const current: Task[] = adjacencyListRepresentation.get(task) ?? [];
        adjacencyListRepresentation.set(task, [...current, ...dependsOn])
    }
    for (const configuration of dependencyConfiguration.tasks) {
       buildAdjacencyList(configuration);
    }
}

buildAdjacencyList(bootstrapDependencyConfiguration);
console.log(adjacencyListRepresentation)


