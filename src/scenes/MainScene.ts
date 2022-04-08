import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Helpers/sceneHelpers";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import "@babylonjs/core/Layers/effectLayerSceneComponent";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Axis, Space } from "@babylonjs/core/Maths/math.axis";
import { Nullable } from "@babylonjs/core/types";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { createEnvironment } from "../utils/createEnvironment";
import { ConnectionPoint } from "../components/ConnectionsPoints";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { createIntersectionEnterAction, createIntersectionExitAction } from "../utils/createIntersectionAction";
import { BUTTON_CONFIG, RIGHT_PARALLEL_CONNECTION_ORDER, SERIES_CONNECTION } from "../utils/constants";
import { createCuttingButton } from "../utils/createCheckingButton";
import { createNumberWiresInfo } from "../utils/createNumberWiresInfo";
import { activateConnectionPoints } from "../utils/activateConnectionPoints";
import { getCheckingMapKey } from "../utils/getCheckingMapKey";
import { keyActions } from "../utils/keyActions";
import { keyAnimation } from "../utils/keyAnimation";
import { TLampMaterials } from "../types";
import { setLampsMaterials } from "../utils/setLampsMaterials";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";

export class MainScene extends Scene {
  engine: Engine;
  canvas: HTMLCanvasElement;
  assetsManager: AssetsManager;
  camera: ArcRotateCamera;
  highlight: HighlightLayer;
  advancedTexture: AdvancedDynamicTexture;

  constructor(engine: Engine, canvas: HTMLCanvasElement, options?: SceneOptions) {
    super(engine, options);
    this.engine = engine;
    this.canvas = canvas;
    this.clearColor = Color4.FromHexString("#768384ff");

    this.assetsManager = new AssetsManager(this);

    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    this.advancedTexture.renderAtIdealSize = true;

    this.highlight = new HighlightLayer("highlight", this, {
      blurHorizontalSize: 0.5,
      blurVerticalSize: 0.5,
    });

    const glowLayer = new GlowLayer("glowLayer", this, {
      blurKernelSize: 128,
      mainTextureRatio: 0.5,
      ldrMerge: true,
    });
    glowLayer.intensity = 2;

    const rightConnectionOrder = RIGHT_PARALLEL_CONNECTION_ORDER;

    const connectionMap: Set<string> = new Set();
    const checkingMap: Set<string> = new Set();
    const connectorMap: Map<string, number> = new Map();
    let outConnectorBattery: Nullable<ConnectionPoint>;
    let inConnectorKey: Nullable<ConnectionPoint>;

    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this);
    ground.visibility = 0;
    ground.isPickable = true;

    let currentNumberConnection = rightConnectionOrder[0].length;
    const numberWiresInfo = createNumberWiresInfo(this.advancedTexture);
    numberWiresInfo.text = `${currentNumberConnection}`;

    let isCuttingMode = false;
    const cuttingButton = createCuttingButton("", "270px", "-50px", this.advancedTexture);
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
    this.camera.position = new Vector3(0, 6, 10);
    this.camera.minZ = 0.0;
    this.camera.maxZ = 100;
    this.camera.lowerRadiusLimit = 7;
    this.camera.upperRadiusLimit = 12;
    this.camera.wheelDeltaPercentage = 0.01;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl();

    createEnvironment(this);

    const meshTaskBattery = this.assetsManager.addContainerTask(
      "meshTaskBattery",
      "",
      "./assets/meshes/",
      "battery.glb",
    );
    meshTaskBattery.onSuccess = task => {
      task.loadedContainer.instantiateModelsToScene(name => name, false);
      const batteryMesh = this.getMeshByName("battery") as Mesh;
      batteryMesh.scaling.scaleInPlace(0.315);
      batteryMesh.position = new Vector3(0, -1, 3.635);
    };

    let turnOnOff = false;
    let lampsMaterials: TLampMaterials[] = [];

    const meshTaskKey = this.assetsManager.addContainerTask("meshTaskKey", "", "./assets/meshes/", "key.glb");
    meshTaskKey.onSuccess = task => {
      const keyRoot = task.loadedContainer.instantiateModelsToScene(name => name, false).rootNodes[0];
      keyRoot.scaling.scaleInPlace(0.325);
      keyRoot.position = new Vector3(-4, -0.05, 0.522);
      const keyMesh = this.getMeshByName("key") as Mesh;
      const switchOnAnimationGroup = keyAnimation(
        keyMesh,
        new Vector3(keyMesh.rotation.x - Tools.ToRadians(10), 0, 0),
        new Vector3(keyMesh.rotation.x + Tools.ToRadians(10), 0, 0),
        1000,
      );
      const switchOffAnimationGroup = keyAnimation(
        keyMesh,
        new Vector3(keyMesh.rotation.x + Tools.ToRadians(10), 0, 0),
        new Vector3(keyMesh.rotation.x - Tools.ToRadians(10), 0, 0),
        1000,
      );
      cuttingButton.onPointerDownObservable.add(() => {
        if (turnOnOff) {
          setLampsMaterials(false, lampsMaterials);
          turnOnOff = false;
          switchOffAnimationGroup.start(false);
        }
      });
      keyActions(
        keyMesh,
        this,
        () => {
          if (!isCuttingMode) {
            this.highlight.addMesh(keyMesh, Color3.Green());
          }
        },
        () => {
          if (!isCuttingMode) {
            this.highlight.removeMesh(keyMesh);
          }
        },
        () => {
          if (!isCuttingMode) {
            if (!turnOnOff) {
              switchOnAnimationGroup.start(false);
              let numberCorrectWires: number[] = [];
              rightConnectionOrder.forEach(order => {
                numberCorrectWires.push(0);
                order.forEach(wire => {
                  if (checkingMap.has(wire) && connectorMap.size === SERIES_CONNECTION.length) {
                    numberCorrectWires[numberCorrectWires.length - 1] += 1;
                  }
                });
              });
              if (numberCorrectWires.indexOf(rightConnectionOrder[0].length) !== -1) {
                setLampsMaterials(true, lampsMaterials);
                console.log("Right!", connectionMap /*, checkingMap, connectorMap*/);
                turnOnOff = true;
              } else {
                setLampsMaterials(false, lampsMaterials);
                switchOffAnimationGroup.start(false);
                console.log("Wrong!", connectionMap /*, checkingMap, connectorMap*/);
              }
            } else {
              setLampsMaterials(false, lampsMaterials);
              turnOnOff = false;
              switchOffAnimationGroup.start(false);
            }
          }
        },
      );
    };

    const meshTaskLamp = this.assetsManager.addContainerTask("meshTaskLamp", "", "./assets/meshes/", "lamp.glb");
    meshTaskLamp.onSuccess = task => {
      const positions = [new Vector3(-2.5, 0.15, -2), new Vector3(1.5, 0.15, -2), new Vector3(4, 0.15, 0.522)];

      positions.forEach((position, index) => {
        const lampRoot = task.loadedContainer.instantiateModelsToScene(name => `${name}_${index}`, true).rootNodes[0];
        console.log(lampRoot);
        lampRoot.rotate(Axis.Y, Math.PI / 2, Space.WORLD);
        lampRoot.scaling.scaleInPlace(0.265);
        lampRoot.position = position;

        const glassMesh = <Mesh>this.getMeshByName(`glass_${index}`);
        (glassMesh.material as PBRMaterial).forceIrradianceInFragment = true;
        (glassMesh.material as PBRMaterial).environmentIntensity = 0.5;
        (glassMesh.material as PBRMaterial).separateCullingPass = true;
        (glassMesh.material as PBRMaterial).subSurface.isRefractionEnabled = true;

        const coreLightMesh = <Mesh>this.getMeshByName(`light_primitive0_${index}`);
        coreLightMesh.setEnabled(false);

        const lightMesh = <Mesh>this.getMeshByName(`light_primitive1_${index}`);
        lightMesh.visibility = 0.1;
        lightMesh.setEnabled(false);

        lampsMaterials.push({
          index,
          glassMesh,
          coreLightMesh,
          lightMesh,
        });
      });

      // @ts-ignore
      console.log(this.getMeshByName(`_root__${positions.length - 1}`));
      (this.getMeshByName(`_root__${positions.length - 1}`) as Mesh)?.rotate(Axis.Y, -Math.PI / 2, Space.WORLD);
    };

    const connectionPoints: ConnectionPoint[] = [];

    SERIES_CONNECTION.forEach((connectorConfig, index) => {
      const connector = new ConnectionPoint(
        {
          id: index,
          type: connectorConfig.type,
          position: connectorConfig.position,
        },
        this,
      );
      this.highlight.addExcludedMesh(connector.startPointMesh);
      this.highlight.addExcludedMesh(connector.wirePointMesh);
      connectionPoints.push(connector);
    });

    connectionPoints.forEach(point => {
      point.OnPickDownTriggerWireObservable.add(wire => {
        if (currentNumberConnection < rightConnectionOrder[0].length) {
          currentNumberConnection += 1;
          console.log(wire);
          // if (point.type === outConnectorBattery.type || point.connectionPoint.type === outConnectorBattery.type) {
          //   outConnectorBattery = null;
          // }

          // inConnectorKey = null;

          numberWiresInfo.text = `${currentNumberConnection}`;
          connectionMap.delete(wire.wireName);
          checkingMap.delete(getCheckingMapKey(wire.wireId));
          wire.wireId.split("-").forEach(con => {
            if (<number>connectorMap.get(con) <= 1) {
              connectorMap.delete(con);
            } else {
              connectorMap.set(con, <number>connectorMap.get(con) - 1);
            }
          });
        }
      });
      point.OnPickUpTriggerWirePointObservable.add(() => {
        if (point.connectionPoint !== null && point.isActive) {
          if (
            !outConnectorBattery &&
            (point.type.includes("b1") || point.connectionPoint.type.includes("b1")) &&
            !inConnectorKey &&
            (point.type.includes("k1") || point.connectionPoint.type.includes("k1"))
          ) {
            if (point.type.includes("b1")) {
              outConnectorBattery = point;
              inConnectorKey = point.connectionPoint;
            } else {
              inConnectorKey = point;
              outConnectorBattery = point.connectionPoint;
            }
            // @ts-ignore
            console.log(outConnectorBattery.type, inConnectorKey.type);
          }
          connectionMap.add(point.wireName);
          checkingMap.add(getCheckingMapKey(point.wireId));
          point.wireId.split("-").forEach(con => {
            if (connectorMap.has(con)) {
              connectorMap.set(con, <number>connectorMap.get(con) + 1);
            } else {
              connectorMap.set(con, 1);
            }
          });
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
            console.log(connectionMap);
            if (
              !connectionMap.has(`${Math.min(pointSecond.id, point.id)}-${Math.max(pointSecond.id, point.id)}`) &&
              point.type.split("_")[0] !== pointSecond.type.split("_")[0]
            ) {
              point.wireName = `${Math.min(pointSecond.id, point.id)}-${Math.max(pointSecond.id, point.id)}`;
              point.wireId = [point.type, pointSecond.type].sort().join("-");
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
        // checkingButton.isVisible = true;
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
