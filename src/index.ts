import {TaskConfiguration} from "./contracts";
import {z} from "zod";
import {InMemoryStateManager} from "./state-manager/in-memory/inMemoryStateManager";
import {Scheduler} from "./scheduler/scheduler";

export const TaskSchema = z.enum([
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k'
])

export type Task = z.infer<typeof TaskSchema>


// const filePath: string = path.join(__dirname, 'bootstrapDependencyConfiguration.ts');
// const configuration = buildDependencyGraph(filePath, null);
// console.log(JSON.stringify(configuration, null, 5))

// if(configuration) {
//     const list: Map<Task, Task[]> = buildAdjacencyList(configuration,  new Map<Task, Task[]>());
//
//
// }

const config: TaskConfiguration<string> = {
    name: "main",
    dependsOn: [],
    tasks: [
        { name: "init", dependsOn: ["main"], tasks: [] },
        { name: "load", dependsOn: ["init"], tasks: [] },
        { name: "report", dependsOn: ["load"], tasks: [] },
    ],
};

const manager = new InMemoryStateManager();
manager.enqueueTaskConfiguration(config);
const scheduler = new Scheduler(manager);

scheduler.on('onStart', ({ name }): void => {
    console.log("onStart", name);
})

scheduler.start();

