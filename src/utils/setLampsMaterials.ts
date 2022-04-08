import { TLampMaterials } from "../types";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";

export const setLampsMaterials = (isRight: boolean, lampsMaterials: TLampMaterials[]) => {
  lampsMaterials.forEach(lamp => {
    lamp.coreLightMesh.setEnabled(isRight);
    lamp.lightMesh.setEnabled(isRight);
    if (isRight) {
      (lamp.glassMesh.material as PBRMaterial).emissiveColor = new Color3(0.15, 0.15, 0.125).scale(1.75);
      (lamp.coreLightMesh.material as PBRMaterial).emissiveColor = new Color3(1, 1, 0.15).scale(1);
      (lamp.lightMesh.material as PBRMaterial).emissiveColor = new Color3(0.75, 0.5, 0.5).scale(1);
    } else {
      (lamp.glassMesh.material as PBRMaterial).emissiveColor = Color3.Black();
      (lamp.coreLightMesh.material as PBRMaterial).emissiveColor = Color3.Black();
      (lamp.lightMesh.material as PBRMaterial).emissiveColor = Color3.Black();
    }
  });
};
