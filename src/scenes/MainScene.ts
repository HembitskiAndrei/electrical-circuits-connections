import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Helpers/sceneHelpers";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { createEnvironment } from "../utils/createEnvironment";
import { ConnectionPoint } from "../components/ConnectionsPoints";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { createIntersectionEnterAction, createIntersectionExitAction } from "../utils/createIntersectionAction";
import { SERIES_CONNECTION } from "../utils/constants";

export class MainScene extends Scene {
  engine: Engine;
  canvas: HTMLCanvasElement;
  assetsManager: AssetsManager;
  camera: ArcRotateCamera;
  advancedTexture: AdvancedDynamicTexture;

  constructor(engine: Engine, canvas: HTMLCanvasElement, options?: SceneOptions) {
    super(engine, options);
    this.engine = engine;
    this.canvas = canvas;
    this.clearColor = new Color4(0.4, 0.7, 0.6, 1);

    this.assetsManager = new AssetsManager(this);

    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    this.advancedTexture.renderAtIdealSize = true;
    this.advancedTexture.isForeground = true;

    this.camera = new ArcRotateCamera("Camera", 0, Math.PI / 2, 10, new Vector3(0, 5, 5), this);
    this.camera.position = new Vector3(0, 3, 5);
    this.camera.minZ = 0.0;
    this.camera.maxZ = 100;
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 20;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl();

    createEnvironment(this);

    const meshTaskPepper = this.assetsManager.addContainerTask("meshTaskPepper", "", "./assets/meshes/", "pepper.glb");
    meshTaskPepper.onSuccess = task => {
      task.loadedContainer.instantiateModelsToScene(name => name, false);
      const pepperMesh = this.getMeshByName("pepper") as Mesh;
      pepperMesh.scaling.scaleInPlace(100);
      pepperMesh.position.x += 10;
    };

    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this);
    ground.visibility = 0;
    ground.isPickable = true;

    const connectionMap: Set<string> = new Set();

    const connectionPoints: ConnectionPoint[] = [];

    SERIES_CONNECTION.forEach((connectorPosition, index) => {
      const connector = new ConnectionPoint(
        {
          id: index,
          position: connectorPosition,
        },
        this,
      );
      connectionPoints.push(connector);
    });

    connectionPoints.forEach(point => {
      // point.OnPickDownTriggerStartPointObservable.add(() => {
      //   connectionMap.delete(point.wireName);
      // });
      point.OnPickUpTriggerWireObservable.add(() => {
        if (point.connectionPoint !== null) {
          connectionMap.add(point.wireName);
        }
      });
      connectionPoints.forEach(pointSecond => {
        if (point.id !== pointSecond.id) {
          createIntersectionEnterAction(point.wirePointMesh, pointSecond.startPointMesh, () => {
            if (!connectionMap.has(`${Math.min(pointSecond.id, point.id)}-${Math.max(pointSecond.id, point.id)}`)) {
              point.wireName = `${Math.min(pointSecond.id, point.id)}-${Math.max(pointSecond.id, point.id)}`;
              point.setIntersectedConnectionPoint(pointSecond);
            }
          });
          createIntersectionExitAction(point.wirePointMesh, pointSecond.startPointMesh, () => {
            point.setIntersectedConnectionPoint(null);
            point.wireName = "";
          });
        }
      });
    });

    this.assetsManager.onFinish = () => {
      this.executeWhenReady(() => {});
    };

    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    this.engine.runRenderLoop(() => {
      this.render();
    });

    this.assetsManager.load();
  }
}
