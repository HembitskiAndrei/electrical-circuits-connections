import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Helpers/sceneHelpers";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import "@babylonjs/core/Layers/effectLayerSceneComponent";
import * as BABYLON from "@babylonjs/core";
// import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
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
import { SERIES_CONNECTION, RIGHT_SERIES_CONNECTION_ORDER, BUTTON_CONFIG } from "../utils/constants";
import { createCheckingButton, createCuttingButton } from "../utils/createCheckingButton";
import { createNumberWiresInfo } from "../utils/createNumberWiresInfo";
import { activateConnectionPoints } from "../utils/activateConnectionPoints";

export class MainScene extends Scene {
  engine: Engine;
  canvas: HTMLCanvasElement;
  assetsManager: AssetsManager;
  camera: ArcRotateCamera;
  highlight: BABYLON.HighlightLayer;
  advancedTexture: AdvancedDynamicTexture;

  constructor(engine: Engine, canvas: HTMLCanvasElement, options?: SceneOptions) {
    super(engine, options);
    this.engine = engine;
    this.canvas = canvas;
    this.clearColor = Color4.FromHexString("#a7babbff");

    this.assetsManager = new AssetsManager(this);

    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    this.advancedTexture.renderAtIdealSize = true;

    this.highlight = new BABYLON.HighlightLayer("highlight", this, {
      blurHorizontalSize: 0.5,
      blurVerticalSize: 0.5,
    });

    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this);
    ground.visibility = 0;
    ground.isPickable = true;

    const checkingButton = createCheckingButton("On", "-50px", "100px", this.advancedTexture);
    checkingButton.isVisible = false;
    checkingButton.onPointerUpObservable.add(() => {
      let numberCorrectWires = 0;
      RIGHT_SERIES_CONNECTION_ORDER.forEach(wire => {
        if (connectionMap.has(wire)) {
          numberCorrectWires += 1;
        }
      });
      if (RIGHT_SERIES_CONNECTION_ORDER.length === numberCorrectWires) {
        console.log("Right!");
      } else {
        console.log("Wrong!");
      }
    });

    let currentNumberConnection = RIGHT_SERIES_CONNECTION_ORDER.length;
    const numberWiresInfo = createNumberWiresInfo(this.advancedTexture);
    numberWiresInfo.text = `${currentNumberConnection}`;

    let isCuttingMode = false;
    const cuttingButton = createCuttingButton("", "-50px", "-100px", this.advancedTexture);
    cuttingButton.onPointerDownObservable.add(() => {
      if (!isCuttingMode) {
        this.defaultCursor = "url('./assets/textures/wireCuttersIcon.png') 6 6, default";
        this.hoverCursor = "url('./assets/textures/wireCuttersIcon.png') 6 6, pointer";
        cuttingButton.background = BUTTON_CONFIG.pressedColor.background;
        cuttingButton.color = BUTTON_CONFIG.pressedColor.color;
        cuttingButton.onPointerEnterObservable.clear();
        cuttingButton.onPointerOutObservable.clear();
        cuttingButton.onPointerUpObservable.clear();
        isCuttingMode = true;
        ground.isPickable = false;
        activateConnectionPoints(connectionPoints, false, true, true);
      } else {
        this.defaultCursor = "auto";
        this.hoverCursor = "pointer";
        cuttingButton.onPointerEnterObservable.add(() => {
          cuttingButton.background = BUTTON_CONFIG.enterColor.background;
          cuttingButton.color = BUTTON_CONFIG.enterColor.color;
        });
        cuttingButton.onPointerOutObservable.add(() => {
          cuttingButton.background = BUTTON_CONFIG.outColor.background;
          cuttingButton.color = BUTTON_CONFIG.outColor.color;
        });
        cuttingButton.onPointerUpObservable.add(() => {
          cuttingButton.background = BUTTON_CONFIG.upColor.background;
          cuttingButton.color = BUTTON_CONFIG.upColor.color;
        });
        isCuttingMode = false;
        ground.isPickable = true;
        if (currentNumberConnection > 0) {
          activateConnectionPoints(connectionPoints, true, false, true);
        } else {
          activateConnectionPoints(connectionPoints, false, false, true);
        }
      }
    });
    cuttingButton.isVisible = false;

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
      pepperMesh.isVisible = false;
      pepperMesh.scaling.scaleInPlace(100);
      pepperMesh.position.x += 10;
    };

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
      this.highlight.addExcludedMesh(connector.startPointMesh);
      this.highlight.addExcludedMesh(connector.wirePointMesh);
      connectionPoints.push(connector);
    });

    connectionPoints.forEach(point => {
      point.OnPickDownTriggerWireObservable.add(wireName => {
        if (currentNumberConnection < RIGHT_SERIES_CONNECTION_ORDER.length) {
          currentNumberConnection += 1;
          numberWiresInfo.text = `${currentNumberConnection}`;
          connectionMap.delete(wireName);
        }
      });
      point.OnPickUpTriggerWirePointObservable.add(() => {
        if (point.connectionPoint !== null && point.isActive) {
          connectionMap.add(point.wireName);
          currentNumberConnection -= 1;
          numberWiresInfo.text = `${currentNumberConnection}`;
          if (currentNumberConnection === 0) {
            activateConnectionPoints(connectionPoints, false, false, true);
          }
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
      this.executeWhenReady(() => {
        checkingButton.isVisible = true;
        cuttingButton.isVisible = true;
      });
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
