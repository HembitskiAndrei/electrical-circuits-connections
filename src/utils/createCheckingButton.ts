import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Image } from "@babylonjs/gui/2D/controls/image";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { BUTTON_CONFIG } from "./constants";

export const createContinueButton = (
  text: string,
  top: string,
  left: string,
  advancedTexture: AdvancedDynamicTexture,
) => {
  const rectBack = new Rectangle();
  rectBack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  rectBack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  rectBack.top = top;
  rectBack.left = left;
  rectBack.width = "190px";
  rectBack.height = "90px";
  rectBack.cornerRadius = 10;
  rectBack.color = BUTTON_CONFIG.defaultColor.color;
  rectBack.thickness = 4;
  rectBack.background = BUTTON_CONFIG.defaultColor.background;
  rectBack.hoverCursor = "pointer";
  rectBack.isPointerBlocker = true;
  rectBack.onPointerEnterObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.enterColor.background;
    rectBack.color = BUTTON_CONFIG.enterColor.color;
  });
  rectBack.onPointerOutObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.outColor.background;
    rectBack.color = BUTTON_CONFIG.outColor.color;
  });
  rectBack.onPointerDownObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.downColor.background;
    rectBack.color = BUTTON_CONFIG.downColor.color;
  });
  rectBack.onPointerUpObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.upColor.background;
    rectBack.color = BUTTON_CONFIG.upColor.color;
  });
  advancedTexture.addControl(rectBack);

  const label = new TextBlock();
  label.text = text;
  label.color = BUTTON_CONFIG.textureColor;
  label.fontSize = 42;
  rectBack.addControl(label);

  return rectBack;
};

export const createCuttingButton = (
  text: string,
  top: string,
  left: string,
  advancedTexture: AdvancedDynamicTexture,
) => {
  const rectBack = new Rectangle();
  rectBack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  rectBack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  rectBack.top = top;
  rectBack.left = left;
  rectBack.width = "190px";
  rectBack.height = "190px";
  rectBack.cornerRadius = 10;
  rectBack.color = BUTTON_CONFIG.defaultColor.color;
  rectBack.thickness = 4;
  rectBack.background = BUTTON_CONFIG.defaultColor.background;
  rectBack.hoverCursor = "pointer";
  rectBack.isPointerBlocker = true;
  rectBack.onPointerEnterObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.enterColor.background;
    rectBack.color = BUTTON_CONFIG.enterColor.color;
  });
  rectBack.onPointerOutObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.outColor.background;
    rectBack.color = BUTTON_CONFIG.outColor.color;
  });
  rectBack.onPointerDownObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.downColor.background;
    rectBack.color = BUTTON_CONFIG.downColor.color;
  });
  rectBack.onPointerUpObservable.add(() => {
    rectBack.background = BUTTON_CONFIG.upColor.background;
    rectBack.color = BUTTON_CONFIG.upColor.color;
  });
  advancedTexture.addControl(rectBack);

  const image = new Image("wireCutters", "./assets/textures/wireCutters.png");
  image.width = "168px";
  image.height = "168px";
  rectBack.addControl(image);

  const label = new TextBlock();
  label.text = text;
  label.color = BUTTON_CONFIG.textureColor;
  label.fontSize = 42;
  rectBack.addControl(label);

  return rectBack;
};
