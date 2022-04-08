import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

import { MainScene } from "../scenes/MainScene";

export const keyActions = (
  key: Mesh,
  scene: MainScene,
  actionOverCallback?: () => void,
  actionOutCallback?: () => void,
  actionDownCallback?: () => void,
) => {
  key.actionManager = new ActionManager(scene);
  key.actionManager?.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
      if (actionOverCallback) {
        actionOverCallback();
      }
    }),
  );
  key.actionManager?.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
      if (actionOutCallback) {
        actionOutCallback();
      }
    }),
  );
  key.actionManager?.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
      if (actionDownCallback) {
        actionDownCallback();
      }
    }),
  );
};
