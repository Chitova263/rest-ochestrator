# 🕸️ DAG-Based API Call Orchestrator

A lightweight orchestrator to manage and execute dependent API calls on application startup using a **Directed Acyclic Graph (DAG)**.

## 📌 Problem

In modern applications frontend application, especially during startup, it's often necessary to perform multiple API calls across various services/microservices. These calls may have dependencies between them:

> Example:  
> - **Service B** must wait for **Service A** to complete.  
> - **Service C** can be called independently of both **A** and **B**.

Manually handling these dependencies and errors using [Promise chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) or [RxJS](https://rxjs.dev/guide/operators) based solutions can quickly become complicated and difficult to maintain.

## ✅ Proposed Solution (First Iteration)

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
        },
        {
            name: 'c',
            dependsOn: [],
        },
        {
            name: 'd',
            dependsOn: ['e', 'f'],
        },
        {
            name: 'f',
            dependsOn: ['g'],
        },
        {
            name: 'e',
            dependsOn: [],
        },
        {
            name: 'g',
            dependsOn: [],
        },
    ],
};
```

## 🚀 Features (In Progress)

- 🛠️ **Declarative Configuration**  
  Define task relationships using JavaScript or JSON. *(In development)*

- 🛠️ **Graph Visualization**  
  Visualize the full dependency graph of tasks for easier debugging and understanding of task flow. *(In development)*

- 🛠️ **DAG Execution Engine**  
  Execute tasks in a dependency-respecting order using a directed acyclic graph. *(Work in progress)*

- 🛠️ **Parallel Execution**  
  Run independent tasks in parallel to improve startup time. *(Work in progress)*

- 🛠️ **Custom Logic Support**  
  Support for attaching async logic (e.g., API calls) to tasks via a `run` function. *(Work in progress)*

- 🛠️ **Cycle Detection**  
  Detect and prevent circular dependencies during config validation. *(Work in progress)*

- 🛠️ **Minimal & Lightweight**  
  Zero external dependencies. Clean, pluggable architecture. *(Work in progress)*

- 🛠️ **Extensible Design**  
  Extend with custom retries
