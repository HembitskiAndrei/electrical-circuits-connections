import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export const SERIES_CONNECTION = [
  new Vector3(-1, 0, 2),
  new Vector3(-4, 0, 1),
  new Vector3(-4, 0, 0),
  new Vector3(-2, 0, -2),
  new Vector3(-1, 0, -2),
  new Vector3(1, 0, -2),
  new Vector3(2, 0, -2),
  new Vector3(1, 0, 2),
];

export const RIGHT_SERIES_CONNECTION_ORDER = ["0-1", "2-3", "4-5", "6-7"];

export const BUTTON_CONFIG = {
  defaultColor: {
    background: "transparent",
    color: "#102a31",
  },
  enterColor: {
    background: "transparent",
    color: "#247c97",
  },
  outColor: {
    background: "transparent",
    color: "#102a31",
  },
  downColor: {
    background: "transparent",
    color: "#247c97",
  },
  upColor: {
    background: "transparent",
    color: "#102a31",
  },
  pressedColor: {
    background: "transparent",
    color: "#ff0000",
  },
  textureColor: "#123e4c",
};
