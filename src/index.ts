import {DependencyConfiguration, Task, taskTypeGuard} from "./contracts";
import fs from 'node:fs';
import path from 'node:path';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import t from '@babel/types';
import {ErrorUtil} from "./error.util";

const filePath: string = path.join(__dirname, 'bootstrapDependencyConfiguration.ts');
const configuration = buildDependencyGraph(filePath, null);
console.log(JSON.stringify(configuration, null, 5))

if(configuration) {
    const list: Map<Task, Task[]> = buildAdjacencyList(configuration,  new Map<Task, Task[]>());
    console.log(list.entries());
}

function buildDependencyGraph(
    pathToFile: string,
    configuration: DependencyConfiguration | null
): DependencyConfiguration | null {
    const sourceCode: string = fs.readFileSync(pathToFile, { encoding: "utf-8" });
    const ast = parse(sourceCode, {
        sourceType: "module",
        sourceFilename: path.basename(pathToFile),
        plugins: ["typescript"]
    });

    const fileImportsMapping: Map<string, string> = new Map();
    traverse(ast, {
        // Finds all the import declarations in the file
        ImportDeclaration(importDeclarationNodePath){
            const node = importDeclarationNodePath.node;
            const importPath = node.source.value;
            for (const specifier of node.specifiers) {
                if(specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
                    const name = specifier.imported.name;
                    fileImportsMapping.set(name, importPath);
                }
            }
        },

        VariableDeclarator(nodePath) {
            const node = nodePath.node;
            if(node.id.type === 'Identifier'
                && node.id.typeAnnotation
                && node.id.typeAnnotation.type === 'TSTypeAnnotation'
            ) {
                const typeAnnotation: t.TSType = node.id.typeAnnotation.typeAnnotation;
                if(typeAnnotation.type === 'TSTypeReference' && typeAnnotation.typeName.type === 'Identifier'){
                    if(node.init?.type === 'ObjectExpression') {
                        const objectProperties: t.ObjectProperty[] = node.init.properties
                            .filter((property: t.ObjectMethod | t.ObjectProperty | t.SpreadElement): property is t.ObjectProperty => property.type === 'ObjectProperty');
                        configuration = getDependencyConfigurationFromObjectProperties(objectProperties, fileImportsMapping, configuration);
                    }
                }
            }
        }
    });
    return configuration;
}

function getDependencyConfigurationFromObjectProperties(
    objectProperties: t.ObjectProperty[],
    fileImportsMapping: Map<string, string>,
    configuration: DependencyConfiguration | null
): DependencyConfiguration {
    const nameObjectProperty: t.ObjectProperty | undefined = objectProperties
        .find((property: t.ObjectProperty): boolean => property.key.type === 'Identifier' && property.key.name === "name");
    const tasksObjectProperty: t.ObjectProperty | undefined = objectProperties
        .find((property: t.ObjectProperty): boolean => property.key.type === 'Identifier' && property.key.name === "tasks");
    const dependsOnObjectProperty: t.ObjectProperty | undefined = objectProperties
        .find((property: t.ObjectProperty): boolean => property.key.type === 'Identifier' && property.key.name === "dependsOn");

    if(!nameObjectProperty) {
        throw new Error('nameObjectProperty is undefined')
    }
    if(!dependsOnObjectProperty) {
        throw new Error('dependsOnObjectProperty is undefined')
    }
    if(!tasksObjectProperty) {
        throw new Error('tasksObjectProperty is undefined')
    }

    return {
        name: getNamePropertyValue(nameObjectProperty),
        dependsOn: getDependsOnPropertyValue(dependsOnObjectProperty),
        tasks: getTasksPropertyValue(tasksObjectProperty, fileImportsMapping, configuration)
    };
}

function getTasksPropertyValue(
    tasksObjectProperty: t.ObjectProperty,
    fileImportsMapping: Map<string, string>,
    configuration: DependencyConfiguration | null
): DependencyConfiguration[]  {
    if(tasksObjectProperty.value.type !== 'ArrayExpression'){
        throw new Error('tasksObjectProperty.value.type must be ArrayExpression');
    }
    // if you find any imports inside the tasks array run it up again
    return tasksObjectProperty.value.elements
        .filter(element => element?.type === "ObjectExpression")
        .map(element => element.properties.filter(property => property.type === 'ObjectProperty'))
        .map(properties => getDependencyConfigurationFromObjectProperties(properties, fileImportsMapping, configuration))
        .concat(
            tasksObjectProperty.value.elements
                .filter(element => element?.type === "Identifier")
                .map(element => {
                    const importPath = fileImportsMapping.get(element.name);
                    if (!importPath) {
                        throw new Error("Invalid object configuration")
                    }
                    return buildDependencyGraph(`${path.join(__dirname, importPath)}.ts`, configuration);
                })
                .filter((dependencyConfiguration) => !!dependencyConfiguration)
        );

}

function getNamePropertyValue(nameObjectProperty: t.ObjectProperty): Task {
    if(nameObjectProperty.value.type !== 'StringLiteral'){
        throw new Error('nameObjectProperty.value.type must be StringLiteral');
    }
    return taskTypeGuard.parse(nameObjectProperty.value.value) ;
}

function getDependsOnPropertyValue(dependsOnObjectProperty: t.ObjectProperty): Task[] {
    if(dependsOnObjectProperty.value.type !== 'ArrayExpression') {
        throw new Error('dependsOnObjectProperty.value.type must be ArrayExpression');
    }
    return dependsOnObjectProperty.value.elements
        .filter((element: t.SpreadElement | t.Expression | null): element is t.StringLiteral => element?.type === 'StringLiteral')
        .map((element: t.StringLiteral): Task => taskTypeGuard.parse(element.value));
}


function buildAdjacencyList(dependencyConfiguration: DependencyConfiguration, adjacencyListRepresentation: Map<Task, Task[]>):  Map<Task, Task[]> {
    const task: Task = dependencyConfiguration.name;
    const dependsOn: Task[] = dependencyConfiguration.dependsOn;
    if (!adjacencyListRepresentation.has(task)) {
        adjacencyListRepresentation.set(task, dependsOn);
    } else {
        const current: Task[] = adjacencyListRepresentation.get(task) ?? [];
        adjacencyListRepresentation.set(task, [...new Set([...current, ...dependsOn]) ])
    }
    for (const configuration of dependencyConfiguration.tasks) {
       adjacencyListRepresentation = buildAdjacencyList(configuration, adjacencyListRepresentation);
    }
    return adjacencyListRepresentation;
}


