import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Nullable } from "@babylonjs/core/types";
import { IAction } from "@babylonjs/core/Actions/action";
export interface IConnectionsPointsConfig {
    id: number;
    position: Vector3;
}
export declare type TActions = {
    actionOver: Nullable<IAction> | undefined;
    actionOut: Nullable<IAction> | undefined;
    [key: string]: Nullable<IAction> | undefined;
};
