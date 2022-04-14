import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { BUTTON_CONFIG } from "./constants";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

export const createNumberWiresInfo = (advancedTexture: AdvancedDynamicTexture) => {
  const rectBack = new Rectangle();
  rectBack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  rectBack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  rectBack.top = "50px";
  rectBack.left = "-50px";
  rectBack.width = "190px";
  rectBack.height = "190px";
  rectBack.cornerRadius = 10;
  rectBack.color = BUTTON_CONFIG.defaultColor.color;
  rectBack.thickness = 4;
  rectBack.background = BUTTON_CONFIG.defaultColor.background;
  advancedTexture.addControl(rectBack);

  const label = new TextBlock();
  label.text = "Wires:";
  label.top = "-35px";
  label.color = BUTTON_CONFIG.textureColor;
  label.fontSize = 42;
  rectBack.addControl(label);

  const counter = new TextBlock();
  counter.text = "0";
  counter.top = "30px";
  counter.color = BUTTON_CONFIG.textureColor;
  counter.fontSize = 48;
  rectBack.addControl(counter);

  return counter;
};
