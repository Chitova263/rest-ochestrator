# Project

Orchestrator to manage and execute asynchronous tasks (e.g. API calls) using a queuing system and a [**Directed Acyclic Graph (DAG)**](https://en.wikipedia.org/wiki/Directed_acyclic_graph). Tasks are processed based on their declared dependencies, allowing for parallel execution where possible and ordered execution where required.

## 📌 Problem

In modern applications frontend application, especially during startup, it's often necessary to perform multiple API calls across various services/microservices. These calls may have dependencies between them:

> Example:
>
> - **Service B** must wait for **Service A** to complete.
> - **Service C** can be called independently of both **A** and **B**.

Manually handling these dependencies and errors using [Promise chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) or [RxJS](https://rxjs.dev/guide/operators) based solutions can quickly become complicated and difficult to maintain.

## ✅ Solution

This project provides a simple, declarative way to define and manage API call dependencies using a **DAG (Directed Acyclic Graph)**. Each task (API call) declares which other tasks it depends on, and the orchestrator runs them in the correct order at startup—maximizing parallelism when possible and respecting dependency rules.

## 🧠 Example Configuration

Below is an example configuration written in JavaScript:

```js
const configuration = {
    name: 'a', // Root task (optional)
    dependsOn: [],
    tasks: [
        {
            name: 'b',
            dependsOn: [],
            tasks: [],
        },
        {
            name: 'c',
            dependsOn: [],
        },
        {
            name: 'd',
            dependsOn: ['e', 'f'],
            tasks: [],
        },
        {
            name: 'f',
            dependsOn: ['g'],
            tasks: [],
        },
        {
            name: 'e',
            dependsOn: [],
            tasks: [],
        },
        {
            name: 'g',
            dependsOn: [],
            tasks: [],
        },
    ],
};
```

## 🚀 Features (In Progress)

- 🛠️ **Declarative Configuration**  
  Define task relationships using JavaScript or JSON.

- 🛠️ **Graph Visualization**  
  Visualize the full dependency graph of tasks for easier debugging and understanding of task flow.

- 🛠️ **DAG Execution Engine**  
  Execute tasks in a dependency-respecting order using a directed acyclic graph.

- 🛠️ **Parallel Execution**  
  Run independent tasks in parallel to improve startup time.

- 🛠️ **Cycle Detection**  
  Detect and prevent circular dependencies during config validation.
