import type { ConnectionPoint } from "../components/ConnectionsPoints";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { IAction } from "@babylonjs/core/Actions/action";

export const setWireActions = (point: ConnectionPoint, isWirePickable: boolean) => {
  Object.values(point.wires).forEach(wire => {
    wire.isPickable = isWirePickable;
    if (wire.isPickable && (wire.actionManager as ActionManager).actions.length < 3) {
      const actionOver = wire.actionManager?.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          point.scene?.highlight.addMesh(wire, Color3.Red());
        }),
      );
      const actionOut = wire.actionManager?.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          point.scene?.highlight.removeMesh(wire);
        }),
      );
      const actionDown = wire.actionManager?.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
          wire.isPickable = false;
          wire.actionManager?.unregisterAction(actionDown as IAction);
          wire.actionManager?.unregisterAction(actionOver as IAction);
          wire.actionManager?.unregisterAction(actionOut as IAction);
          delete point.wires[`${wire.name}`];
          wire.dispose();
          point.OnPickDownTriggerWireObservable.notifyObservers({
            wireName: wire.name,
            wireId: wire.id,
          });
        }),
      );
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
