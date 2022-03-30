import type { ConnectionPoint } from "../components/ConnectionsPoints";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TActions } from "../types";
import { IAction } from "@babylonjs/core/Actions/action";

export const setWireActions = (point: ConnectionPoint, isWirePickable: boolean) => {
  Object.values(point.wires).forEach(wire => {
    wire.isPickable = isWirePickable;
    let actions: TActions = {
      actionOver: null,
      actionOut: null,
    };
    if (wire.isPickable) {
      actions.actionOver = wire.actionManager?.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
          point.OnPickDownTriggerWireObservable.notifyObservers(wire.name);
          delete point.wires[`${wire.name}`];
          wire.dispose();
          point.scene.defaultCursor = "url('./assets/textures/wireCuttersIcon.png') 6 6, auto";
        }),
      );
      actions.actionOver = wire.actionManager?.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          point.scene?.highlight.addMesh(wire, Color3.Red());
        }),
      );
      actions.actionOut = wire.actionManager?.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          point.scene?.highlight.removeMesh(wire);
        }),
      );
    } else {
      if (actions.actionOver !== null) {
        wire.actionManager?.unregisterAction(actions.actionOver as IAction);
      }
      if (actions.actionOut !== null) {
        wire.actionManager?.unregisterAction(actions.actionOut as IAction);
      }
    }
  });
};

export const activateConnectionPoints = (
  connectionPoints: ConnectionPoint[],
  isActive: boolean,
  isWirePickable: boolean,
  isSettingAction: boolean,
) => {
  connectionPoints.forEach(point => {
    point.isActive = isActive;
    point.startPointMesh.isPickable = isActive;
    if (isSettingAction) {
      setWireActions(point, isWirePickable);
    }
  });
};
