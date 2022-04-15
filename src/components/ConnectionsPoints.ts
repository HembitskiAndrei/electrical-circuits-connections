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
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { curveWay } from "../utils/сurveWay";

export class ConnectionPoint {
  id: number;
  type: string;
  sign: string;
  position: Vector3;
  scene: MainScene;
  startPointMesh: Mesh;
  wirePointMesh: Mesh;
  currentWire: Mesh;
  connectionPoint: Nullable<ConnectionPoint>;
  draggable: boolean;
  wireName: string;
  wireId: string;
  wires: {
    [key: string]: Mesh;
  };
  isActive: boolean;
  OnPickDownTriggerStartPointObservable: Observable<null>;
  OnPickUpTriggerWirePointObservable: Observable<null>;
  OnPointerOverTriggerWireObservable: Observable<Mesh>;
  OnPointerOutTriggerWireObservable: Observable<Mesh>;
  OnPickDownTriggerWireObservable: Observable<{
    wireName: string;
    wireId: string;
  }>;
  private deltaVector: Vector3[];

  constructor(config: IConnectionsPointsConfig, scene: MainScene) {
    this.id = config.id;
    this.type = config.type;
    this.sign = "";
    this.position = config.position;
    this.scene = scene;
    this.draggable = false;
    this.connectionPoint = null;
    this.OnPickUpTriggerWirePointObservable = new Observable();
    this.OnPickDownTriggerStartPointObservable = new Observable();
    this.OnPointerOverTriggerWireObservable = new Observable();
    this.OnPointerOutTriggerWireObservable = new Observable();
    this.OnPickDownTriggerWireObservable = new Observable();
    this.wireName = "";
    this.wireId = "";
    this.wires = {};
    this.isActive = true;

    this.deltaVector = [];

    this.wirePointMesh = MeshBuilder.CreateSphere(`wirePointMesh_${this.id}`, { diameter: 0.15, segments: 8 }, scene);
    this.wirePointMesh.visibility = 0;
    this.wirePointMesh.position = this.position;
    this.wirePointMesh.isPickable = true;
    this.wirePointMesh.actionManager = new ActionManager(scene);

    const startPointMeshMaterial = new PBRMaterial("startPointMeshMaterial", this.scene);
    startPointMeshMaterial.metallic = 0.75;
    startPointMeshMaterial.roughness = 0.75;
    startPointMeshMaterial.albedoColor = new Color3(2, 0.75, 0.25);

    this.startPointMesh = MeshBuilder.CreateSphere(`startPointMesh_${this.id}`, { diameter: 0.3, segments: 8 }, scene);
    this.startPointMesh.position = this.position;
    this.startPointMesh.visibility = 1;
    this.startPointMesh.isPickable = true;
    this.startPointMesh.actionManager = new ActionManager(scene);
    this.startPointMesh.material = startPointMeshMaterial;

    this._createAction();
  }

  _createAction() {
    this.wirePointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        if (this.isActive) {
          this._draggableSetting(true);
          this._onWireMove();
        }
      }),
    );
    this.wirePointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickUpTrigger, () => {
        if (this.isActive) {
          this._draggableSetting(false);
          this.startPointMesh.isPickable = true;
          if (this.connectionPoint !== null) {
            this.wirePointMesh.position = this.connectionPoint.startPointMesh.getAbsolutePosition();
            this.OnPickUpTriggerWirePointObservable.notifyObservers(null);
            this.connectionPoint = null;
            this.wirePointMesh.isPickable = false;
            this._updateWire([this.startPointMesh.getAbsolutePosition(), this.wirePointMesh.position]);
            this.currentWire.name = this.wireName;
            this.currentWire.id = this.wireId;
            (this.currentWire?.material as PBRMaterial).albedoColor = new Color3(0, 1, 0);
            this.wires[`${this.currentWire.name}`] = this.currentWire;
          } else {
            this.wirePointMesh.position = this.startPointMesh.getAbsolutePosition();
            this.currentWire.dispose();
          }
        }
      }),
    );

    this.startPointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        if (this.isActive) {
          this.OnPickDownTriggerStartPointObservable.notifyObservers(null);
          this.startPointMesh.isPickable = false;
          this.wirePointMesh.isPickable = true;
          this._draggableSetting(true);
          this._onWireMove();
          this.wirePointMesh.position = this.startPointMesh.getAbsolutePosition();
          this.currentWire = this._createWire([this.startPointMesh.getAbsolutePosition(), this.wirePointMesh.position]);
          this.currentWire.isPickable = false;
        }
      }),
    );
    this.startPointMesh.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickUpTrigger, () => {
        if (this.isActive) {
          this.startPointMesh.isPickable = true;
          this._draggableSetting(false);
        }
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
    this.deltaVector = Array.from({ length: 4 }).map(() => {
      return new Vector3(
        (Math.random() - Math.random()) * 0.5,
        Math.random() - Math.random(),
        (Math.random() - Math.random()) * 0.5,
      );
    });
    const wireMaterial = new PBRMaterial("wireMaterial", this.scene);
    wireMaterial.metallic = 1;
    wireMaterial.roughness = 0.75;
    wireMaterial.albedoColor = new Color3(1, 0, 0);
    const wire = MeshBuilder.CreateTube(
      "wire",
      {
        path: curveWay(path, this.deltaVector),
        radius: 0.05,
        arc: 0.15,
        cap: Mesh.CAP_ALL,
        updatable: true,
      },
      this.scene,
    );
    wire.material = wireMaterial;
    wire.actionManager = new ActionManager(this.scene);

    return wire;
  }

  _updateWire(path: Vector3[]) {
    this.currentWire = MeshBuilder.CreateTube("tube", {
      path: curveWay(path, this.deltaVector),
      instance: this.currentWire,
    });
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
