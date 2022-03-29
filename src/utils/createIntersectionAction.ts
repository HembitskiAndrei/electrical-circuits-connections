import {Mesh} from "@babylonjs/core/Meshes/mesh";
import {InstancedMesh} from "@babylonjs/core/Meshes/instancedMesh";
import {ActionManager} from "@babylonjs/core/Actions/actionManager";
import {ExecuteCodeAction} from "@babylonjs/core/Actions/directActions";

export const createIntersectionEnterAction = (
  instancedMesh: Mesh | InstancedMesh,
  intersectionMesh: Mesh | InstancedMesh,
  callback: () => void
) => {
  instancedMesh.actionManager?.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnIntersectionEnterTrigger,
        parameter: intersectionMesh,
      },
      () => {
        callback();
      }
    )
  );
};

export const createIntersectionExitAction = (
  instancedMesh: Mesh |InstancedMesh,
  intersectionMesh: Mesh | InstancedMesh,
  callback: () => void
) => {
  instancedMesh.actionManager?.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnIntersectionExitTrigger,
        parameter: intersectionMesh,
      },
      () => {
        callback();
      }
    )
  );
};
