//import { TaskStore } from '../contracts';

// class ReactQueryTaskStoreAdapter<T extends string> implements TaskStore<T> {
//     constructor(
//         private readonly queryClient: QueryClient,
//         private readonly queryKey: string
//     ) {}
//
//     getState(): Task<T>[] {
//         return this.queryClient.getQueryData<Task<T>[]>(this.queryKey) ?? [];
//     }
//
//     setState(tasks: Task<T>[]): void {
//         this.queryClient.setQueryData(this.queryKey, tasks);
//     }
// }
