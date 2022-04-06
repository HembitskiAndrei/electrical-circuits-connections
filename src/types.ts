import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type TConnectorMap = {
  type: string;
  wireName?: string;
};

export type TConnector = TConnectorMap & {
  position: Vector3;
};

export interface IConnectionsPointsConfig extends TConnector {
  id: number;
}
