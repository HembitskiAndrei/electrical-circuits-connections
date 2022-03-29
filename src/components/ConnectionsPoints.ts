import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { IConnectionsPointsConfig } from "../types";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Matrix } from "@babylonjs/core/Maths/math.vector";
import type { MainScene } from "../scenes/MainScene";
import { Nullable } from "@babylonjs/core/types";
import { Observable } from "@babylonjs/core/Misc/observable";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

export class ConnectionPoint {
  id: number;
  position: Vector3;
  scene: MainScene;
  startPointMesh: Mesh;
  wirePointMesh: Mesh;
  currentWire: Mesh;
  connectionPoint: Nullable<ConnectionPoint>;
  draggable: boolean;
  wireName: string;
  wires: Mesh[];
  OnPickDownTriggerStartPointObservable: Observable<null>;
  OnPickUpTriggerWireObservable: Observable<null>;

  constructor(config: IConnectionsPointsConfig, scene: MainScene) {
    this.id = config.id;
    this.position = config.position;
    this.scene = scene;
    this.draggable = false;
    this.connectionPoint = null;
    this.OnPickUpTriggerWireObservable = new Observable();
    this.OnPickDownTriggerStartPointObservable = new Observable();
    this.wireName = "";
    this.wires = [];

    this.wirePointMesh = MeshBuilder.CreateSphere(`wirePointMesh_${this.id}`, { diameter: 0.25, segments: 8 }, scene);
    this.wirePointMesh.visibility = 0.2;
    this.wirePointMesh.position = this.position;
    this.wirePointMesh.isPickable = true;
    this.wirePointMesh.actionManager = new ActionManager(scene);

    this.startPointMesh = MeshBuilder.CreateSphere(`startPointMesh_${this.id}`, { diameter: 0.5, segments: 8 }, scene);
    this.startPointMesh.position = this.position;
    this.startPointMesh.visibility = 0.1;
    this.startPointMesh.isPickable = true;
    this.startPointMesh.actionManager = new ActionManager(scene);

    this._createAction();
  }

  _createAction() {
    this.wirePointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        // console.log(1);
      }),
    );
    this.wirePointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        // console.log(2);
      }),
    );

    this.wirePointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        this._draggableSetting(true);
        this._onWireMove();
      }),
    );
    this.wirePointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickUpTrigger, () => {
        this._draggableSetting(false);
        this.startPointMesh.isPickable = true;
        if (this.connectionPoint !== null) {
          this.wirePointMesh.position = this.connectionPoint.startPointMesh.getAbsolutePosition();
          this.OnPickUpTriggerWireObservable.notifyObservers(null);
          this.connectionPoint = null;
          this.wirePointMesh.isPickable = false;
          this._updateWire([this.startPointMesh.getAbsolutePosition(), this.wirePointMesh.position]);
          (this.currentWire?.material as StandardMaterial).diffuseColor = new Color3(0, 1, 0);
        } else {
          this.wirePointMesh.position = this.startPointMesh.getAbsolutePosition();
          this.currentWire.dispose();
          this.wires.splice(this.wires.length - 1, 1);
        }
      }),
    );

    this.startPointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        this.OnPickDownTriggerStartPointObservable.notifyObservers(null);
        this.startPointMesh.isPickable = false;
        this.wirePointMesh.isPickable = true;
        this._draggableSetting(true);
        this._onWireMove();
        this.wirePointMesh.position = this.startPointMesh.getAbsolutePosition();
        this.currentWire = this._createWire([this.startPointMesh.getAbsolutePosition(), this.wirePointMesh.position]);
        this.currentWire.isPickable = false;
        this.wires.push(this.currentWire);
      }),
    );
    this.startPointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickUpTrigger, () => {
        this.startPointMesh.isPickable = true;
        this._draggableSetting(false);
      }),
    );
  }

  _draggableSetting(value: boolean) {
    if (value) {
      this.scene.activeCamera?.detachControl();
    } else {
      this.scene.activeCamera?.attachControl();
    }
    this.draggable = value;
  }

  _createWire(path: Vector3[]) {
    const wireMaterial = new StandardMaterial("wireMaterial", this.scene);
    wireMaterial.diffuseColor = new Color3(1, 0, 0);
    const wire = MeshBuilder.CreateTube(
      "wire",
      {
        path,
        radius: 0.1,
        updatable: true,
      },
      this.scene,
    );
    wire.material = wireMaterial;

    return wire;
  }

  _updateWire(path: Vector3[]) {
    this.currentWire = MeshBuilder.CreateTube("tube", { path, instance: this.currentWire });
  }

  _onWireMove() {
    this.scene.onPointerMove = () => {
      if (this.draggable) {
        this.wirePointMesh.isPickable = false;
        const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), null);
        const hit = this.scene.pickWithRay(ray);
        const pickedPoint = hit?.pickedPoint;
        this.wirePointMesh.position = pickedPoint || Vector3.Zero();
        this._updateWire([this.startPointMesh.getAbsolutePosition(), this.wirePointMesh.position]);
        this.wirePointMesh.isPickable = true;
      }
    };
  }

  setIntersectedConnectionPoint(connectionPoint: Nullable<ConnectionPoint>) {
    this.connectionPoint = connectionPoint;
  }
}
