import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
export declare const createIntersectionEnterAction: (instancedMesh: Mesh | InstancedMesh, intersectionMesh: Mesh | InstancedMesh, callback: () => void) => void;
export declare const createIntersectionExitAction: (instancedMesh: Mesh | InstancedMesh, intersectionMesh: Mesh | InstancedMesh, callback: () => void) => void;
