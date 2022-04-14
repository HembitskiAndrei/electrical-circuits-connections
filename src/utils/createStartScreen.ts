import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { HOVER_COLOR_BORDER, DEFAULT_COLOR_BORDER } from "./constants";

const addButton = (text: string, container: Rectangle, top: string, left: string) => {
  const button = new Rectangle();
  button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  button.top = top;
  button.left = left;
  button.width = "240px";
  button.height = "110px";
  button.cornerRadius = 30;
  button.color = DEFAULT_COLOR_BORDER;
  button.thickness = 2;
  button.background = "transparent";
  button.hoverCursor = "pointer";
  button.isPointerBlocker = true;
  container.addControl(button);

  const label = new TextBlock();
  label.text = text;
  label.fontStyle = "bold";
  label.fontFamily = "Arial Black";
  label.color = HOVER_COLOR_BORDER;
  label.fontSize = 32;
  label.outlineWidth = 0;
  label.outlineColor = "gray";
  button.addControl(label);

  button.onPointerEnterObservable.add(() => {
    button.thickness = 6;
    label.outlineWidth = 5;
    button.color = HOVER_COLOR_BORDER;
  });
  button.onPointerOutObservable.add(() => {
    button.thickness = 2;
    label.outlineWidth = 0;
    button.color = DEFAULT_COLOR_BORDER;
  });
  button.onPointerDownObservable.add(() => {
    button.thickness = 6;
    label.outlineWidth = 5;
    button.color = HOVER_COLOR_BORDER;
    container.isVisible = false;
    button.isVisible = false;
  });
  button.onPointerUpObservable.add(() => {
    button.thickness = 2;
    label.outlineWidth = 0;
    button.color = HOVER_COLOR_BORDER;
  });

  return button;
};

export const createStartScreen = (advancedTexture: AdvancedDynamicTexture) => {
  const container = new Rectangle();
  container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  container.background = "#000000DD";
  container.width = 1;
  container.height = 1;
  container.thickness = 0;
  container.zIndex = 9998;
  advancedTexture.addControl(container);

  const bonusInfoContainer = new Rectangle();
  bonusInfoContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  bonusInfoContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  bonusInfoContainer.width = 0.5;
  bonusInfoContainer.height = 1;
  bonusInfoContainer.thickness = 0;
  bonusInfoContainer.background = "transparent";
  container.addControl(bonusInfoContainer);

  const text = new TextBlock();
  text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  text.textWrapping = TextWrapping.WordWrap;
  text.width = "295px";
  text.top = "50px";
  text.left = "5px";
  text.text = "Постройте электро цепь в соответствии со схемой";
  text.fontFamily = "Arial";
  text.color = "white";
  text.fontSize = 20;
  container.addControl(text);

  const parallelButton = addButton("PARALLEL", container, "-40px", "-140px");
  const serialButton = addButton("SERIAL", container, "-40px", "140px");

  return {
    container,
    parallelButton,
    serialButton,
  };
};
