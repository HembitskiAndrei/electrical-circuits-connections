import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
export declare const keyAnimation: (keyMesh: Mesh, initRotation: Vector3, target: Vector3, duration: number) => AnimationGroup;
