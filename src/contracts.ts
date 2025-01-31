import {z} from "zod";

export interface DependencyConfiguration {
    name: Task;
    tasks: DependencyConfiguration[];
    dependsOn: Task[]
}

export const taskTypeGuard = z.enum([
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

export type Task = z.infer<typeof taskTypeGuard>

export interface GraphNode {

}
