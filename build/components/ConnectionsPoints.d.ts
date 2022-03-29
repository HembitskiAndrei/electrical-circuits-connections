import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { IConnectionsPointsConfig } from "../types";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { MainScene } from "../scenes/MainScene";
import { Nullable } from "@babylonjs/core/types";
import { Observable } from "@babylonjs/core/Misc/observable";
export declare class ConnectionPoint {
    id: number;
    position: Vector3;
    scene: MainScene;
    startPointMesh: Mesh;
    wirePointMesh: Mesh;
    currentWire: Mesh;
    connectionPoint: Nullable<ConnectionPoint>;
    draggable: boolean;
    wires: Mesh[];
    OnPickUpTriggerWireObservable: Observable<null>;
    constructor(config: IConnectionsPointsConfig, scene: MainScene);
    _createAction(): void;
    _draggableSetting(value: boolean): void;
    _createWire(path: Vector3[]): Mesh;
    _updateWire(path: Vector3[]): void;
    _onWireMove(): void;
    setIntersectedConnectionPoint(connectionPoint: ConnectionPoint): void;
}
