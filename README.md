# Problem
- Sometimes on application startup you want to orchestrate API calls from different services for example
```txt
call to service b needs to wait for call to service a ,
but call to service c is independant of both call to service a and call to service b
```
- We can declaratively represent this api call dependency using a Directed Acrylic Graph (DAG) is some form of dependency graph
  and run the configuration on application startup
```js
configuration = {
    name: 'a',
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
    ],
    dependsOn: [],
};
```

  
