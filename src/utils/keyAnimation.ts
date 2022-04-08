import { Animation } from "@babylonjs/core/Animations/animation";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export const keyAnimation = (keyMesh: Mesh, initRotation: Vector3, target: Vector3, duration: number) => {
  const keyRotationAnimation = new Animation(
    "keyRotationAnimation",
    "rotation",
    duration,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE,
  );

  const keysRotation = [];
  keysRotation.push({ frame: 0, value: initRotation });
  keysRotation.push({ frame: 60, value: target });
  keyRotationAnimation.setKeys(keysRotation);

  let animationGroup = new AnimationGroup("keyRotationAnimationGroups", keyMesh.getScene());
  animationGroup.addTargetedAnimation(keyRotationAnimation, keyMesh);

  return animationGroup;
};
