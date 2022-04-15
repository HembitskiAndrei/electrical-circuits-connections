import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Helpers/sceneHelpers";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import "@babylonjs/core/Layers/effectLayerSceneComponent";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Axis, Space } from "@babylonjs/core/Maths/math.axis";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { createEnvironment } from "../utils/createEnvironment";
import { ConnectionPoint } from "../components/ConnectionsPoints";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { createIntersectionEnterAction, createIntersectionExitAction } from "../utils/createIntersectionAction";
import {
  BUTTON_CONFIG,
  RIGHT_PARALLEL_CONNECTION_ORDER,
  RIGHT_SERIES_CONNECTION_ORDER,
  SERIES_CONNECTION,
} from "../utils/constants";
import { createCuttingButton, createContinueButton } from "../utils/createCheckingButton";
import { createStartScreen } from "../utils/createStartScreen";
import { createNumberWiresInfo, createDiagramInfo } from "../utils/createNumberWiresInfo";
import { activateConnectionPoints } from "../utils/activateConnectionPoints";
import { getCheckingMapKey } from "../utils/getCheckingMapKey";
import { keyActions } from "../utils/keyActions";
import { keyAnimation } from "../utils/keyAnimation";
import { setLampsMaterials } from "../utils/setLampsMaterials";
import { TLampMaterials } from "../types";
import { buttonAnimation } from "../utils/buttonAnimation";

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

    let rightConnectionOrder: string[][];
    let currentNumberConnection = 0;

    const connectionMap: Set<string> = new Set();
    const checkingMap: Set<string> = new Set();
    const connectorMap: Map<string, number> = new Map();
    const devicesMap: Map<string, ConnectionPoint[]> = new Map();
    const deviceSignMap: Map<string, string> = new Map();

    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this);
    ground.visibility = 0;
    ground.isPickable = true;

    const numberWiresInfo = createNumberWiresInfo(this.advancedTexture);
    const diagramInfo = createDiagramInfo(this.advancedTexture);

    const resetScene = () => {
      currentNumberConnection = rightConnectionOrder[0].length;
      numberWiresInfo.text = `${currentNumberConnection}`;
      connectionMap.clear();
      checkingMap.clear();
      connectorMap.clear();
      devicesMap.clear();

      connectionPoints.forEach(point => {
        Object.values(point.wires).forEach(wire => {
          wire.isPickable = false;
          wire.actionManager?.dispose();
          delete point.wires[`${wire.name}`];
          wire.dispose();
        });

        point.sign = "";
        const typeWords = point.type.split("_");
        if (devicesMap.has(typeWords[0])) {
          devicesMap.set(typeWords[0], [...(devicesMap.get(typeWords[0]) as ConnectionPoint[]), point]);
        } else {
          devicesMap.set(typeWords[0], [point]);
        }
      });
      (devicesMap.get("b1") as ConnectionPoint[])[0].sign = "+";
      (devicesMap.get("b1") as ConnectionPoint[])[1].sign = "-";
    };

    const backButton = createContinueButton("Back", "-250px", "50px", this.advancedTexture, 0);
    backButton.onPointerDownObservable.add(() => {
      resetScene();
    });

    const continueButton = createContinueButton("Continue", "-50px", "-50px", this.advancedTexture);
    continueButton.isVisible = false;
    continueButton.onPointerDownObservable.add(() => {
      resetScene();
    });

    buttonAnimation(continueButton, 1, 1.1, 100).play(true);

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

    const buttons = createStartScreen(this.advancedTexture);
    buttons.serialButton.onPointerUpObservable.add(() => {
      rightConnectionOrder = RIGHT_SERIES_CONNECTION_ORDER;
      currentNumberConnection = rightConnectionOrder[0].length;
      numberWiresInfo.text = `${currentNumberConnection}`;
      ground.isPickable = true;
      activateConnectionPoints(connectionPoints, true, false, true);
      diagramInfo.imageSerial.isVisible = true;
      diagramInfo.imageParallel.isVisible = !diagramInfo.imageSerial.isVisible;
    });

    buttons.parallelButton.onPointerUpObservable.add(() => {
      rightConnectionOrder = RIGHT_PARALLEL_CONNECTION_ORDER;
      currentNumberConnection = rightConnectionOrder[0].length;
      numberWiresInfo.text = `${currentNumberConnection}`;
      ground.isPickable = true;
      activateConnectionPoints(connectionPoints, true, false, true);
      diagramInfo.imageParallel.isVisible = true;
      diagramInfo.imageSerial.isVisible = !diagramInfo.imageParallel.isVisible;
    });

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

      keyMesh.isPickable = false;
      buttons.serialButton.onPointerUpObservable.add(() => {
        keyMesh.isPickable = true;
      });
      buttons.parallelButton.onPointerUpObservable.add(() => {
        keyMesh.isPickable = true;
      });

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
      const resetWires = () => {
        if (turnOnOff) {
          setLampsMaterials(false, lampsMaterials);
          turnOnOff = false;
          switchOffAnimationGroup.start(false);
        }

        keyMesh.isPickable = false;
        ground.isPickable = false;
        activateConnectionPoints(connectionPoints, false, false, false);

        buttons.container.isVisible = true;
        buttons.serialButton.isVisible = true;
        buttons.parallelButton.isVisible = true;
        continueButton.isVisible = false;
      };
      backButton.onPointerDownObservable.add(() => {
        resetWires();
      });
      continueButton.onPointerDownObservable.add(() => {
        resetWires();
      });

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

              const l1Device = devicesMap.get("l1") as ConnectionPoint[];
              const l2Device = devicesMap.get("l2") as ConnectionPoint[];
              if (
                numberCorrectWires.indexOf(rightConnectionOrder[0].length) !== -1 &&
                l1Device[0].sign !== l1Device[1].sign &&
                l2Device[0].sign !== l2Device[1].sign
              ) {
                setLampsMaterials(true, lampsMaterials);
                console.log("Right!", connectionMap, devicesMap);
                turnOnOff = true;
                continueButton.isVisible = true;
              } else {
                setLampsMaterials(false, lampsMaterials);
                switchOffAnimationGroup.start(false);
                console.log("Wrong!", connectionMap);
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
      const positions = [new Vector3(-2.5, 0.15, -2), new Vector3(1.5, 0.15, -2) /*, new Vector3(4, 0.15, 0.522)*/];

      positions.forEach((position, index) => {
        const lampRoot = task.loadedContainer.instantiateModelsToScene(name => `${name}_${index}`, true).rootNodes[0];
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

      // (this.getMeshByName(`__root___${positions.length - 1}`) as Mesh)?.rotate(Axis.Y, -Math.PI / 2, Space.WORLD);
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

      const typeWords = connectorConfig.type.split("_");
      if (devicesMap.has(typeWords[0])) {
        devicesMap.set(typeWords[0], [...(devicesMap.get(typeWords[0]) as ConnectionPoint[]), connector]);
      } else {
        devicesMap.set(typeWords[0], [connector]);
      }
      connectionPoints.push(connector);
    });

    (devicesMap.get("b1") as ConnectionPoint[])[0].sign = "+";
    (devicesMap.get("b1") as ConnectionPoint[])[1].sign = "-";

    connectionPoints.forEach(point => {
      point.OnPickDownTriggerWireObservable.add(wire => {
        if (currentNumberConnection < rightConnectionOrder[0].length) {
          currentNumberConnection += 1;
          numberWiresInfo.text = `${currentNumberConnection}`;
          connectionMap.delete(wire.wireName);
          checkingMap.delete(getCheckingMapKey(wire.wireId));
          wire.wireId.split("-").forEach(con => {
            if (<number>connectorMap.get(con) <= 1) {
              const subCon = con.split("_");
              if (subCon[0].includes("l")) {
                (devicesMap.get(subCon[0]) as ConnectionPoint[])[+subCon[1]].sign = "";
              }
              connectorMap.delete(con);
              if (subCon[0].includes("k")) {
                let keyCount = 0;
                connectorMap.forEach((value, key) => {
                  if (key.includes("k")) {
                    keyCount += 1;
                  }
                });
                if (!keyCount) {
                  (devicesMap.get(subCon[0]) as ConnectionPoint[])[0].sign = "";
                  (devicesMap.get(subCon[0]) as ConnectionPoint[])[1].sign = "";
                }
              }
            } else {
              connectorMap.set(con, <number>connectorMap.get(con) - 1);
            }
          });
        }
      });
      point.OnPickUpTriggerWirePointObservable.add(() => {
        if (point.connectionPoint !== null && point.isActive) {
          deviceSignMap.set(point.connectionPoint.type.split("_")[0], point.sign);

          const tmpTypeConnectionPoint = point.connectionPoint.type.split("_");
          const tmpTypeConnector = point.type.split("_");
          if (
            (tmpTypeConnectionPoint[0].includes("k") && tmpTypeConnector[0].includes("b")) ||
            (tmpTypeConnectionPoint[0].includes("b") && tmpTypeConnector[0].includes("k"))
          ) {
            (devicesMap.get(tmpTypeConnectionPoint[0]) as ConnectionPoint[])[0].sign = point.sign;
            (devicesMap.get(tmpTypeConnectionPoint[0]) as ConnectionPoint[])[1].sign = point.sign;
          } else if (
            tmpTypeConnectionPoint[0].includes("l") &&
            (tmpTypeConnector[0].includes("k") || tmpTypeConnector[0].includes("b"))
          ) {
            point.connectionPoint.sign = point.sign;
          } else if (
            (tmpTypeConnectionPoint[0].includes("k") || tmpTypeConnectionPoint[0].includes("b")) &&
            tmpTypeConnector[0].includes("l")
          ) {
            point.sign = point.connectionPoint.sign;
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
