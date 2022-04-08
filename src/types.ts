import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export type TConnectorMap = {
  type: string;
  wireName?: string;
};

export type TConnector = TConnectorMap & {
  position: Vector3;
};

export type TLampMaterials = {
  index: number;
  glassMesh: Mesh;
  coreLightMesh: Mesh;
  lightMesh: Mesh;
};

export interface IConnectionsPointsConfig extends TConnector {
  id: number;
}
