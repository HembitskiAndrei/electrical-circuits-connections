import { Animation } from "@babylonjs/core/Animations/animation";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";

export const buttonAnimation = (buttonControl: Rectangle, initTarget: number, target: number, duration: number) => {
  const buttonScalingXAnimation = new Animation(
    "buttonScalingXAnimation",
    "scaleX",
    duration,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE,
  );

  const buttonScalingYAnimation = new Animation(
    "buttonScalingAnimation",
    "scaleY",
    duration,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE,
  );

  const keysRotation = [];
  keysRotation.push({ frame: 0, value: initTarget });
  keysRotation.push({ frame: 30, value: target });
  keysRotation.push({ frame: 60, value: initTarget });
  buttonScalingXAnimation.setKeys(keysRotation);
  buttonScalingYAnimation.setKeys(keysRotation);

  let animationGroup = new AnimationGroup("buttonScalingAnimationGroup");
  animationGroup.addTargetedAnimation(buttonScalingXAnimation, buttonControl);
  animationGroup.addTargetedAnimation(buttonScalingYAnimation, buttonControl);

  return animationGroup;
};
