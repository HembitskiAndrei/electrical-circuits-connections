import { Vector3 } from "@babylonjs/core/Maths/math.vector";

// battery => 0,
// key     => 1,
// lamp    => 2,

export const SERIES_CONNECTION = [
  {
    type: "b1_0",
    position: new Vector3(-1, 0, 3),
  },
  {
    type: "k1_0",
    position: new Vector3(-4, 0, 1.5),
  },
  {
    type: "k1_1",
    position: new Vector3(-4, 0, -0.5),
  },
  {
    type: "l1_0",
    position: new Vector3(-3.25, 0, -2),
  },
  {
    type: "l1_1",
    position: new Vector3(-1.75, 0, -2),
  },
  {
    type: "l2_0",
    position: new Vector3(0.75, 0, -2),
  },
  {
    type: "l2_1",
    position: new Vector3(2.25, 0, -2),
  },
  {
    type: "b1_1",
    position: new Vector3(1, 0, 3),
  },
];

export const COMBINED_CONNECTION = [
  new Vector3(-1, 0, 3),
  new Vector3(-4, 0, 1),
  new Vector3(-4, 0, 0),
  new Vector3(-2, 0, -2),
  new Vector3(-1, 0, -2),
  new Vector3(1, 0, -2),
  new Vector3(2, 0, -2),
  new Vector3(4, 0, 0),
  new Vector3(4, 0, 1),
  new Vector3(1, 0, 3),
];

export const RIGHT_SERIES_CONNECTION_ORDER = [
  ["b1-k1", "k1-l1", "l1-l2", "b1-l2"],
  ["b1-k1", "k1-l2", "l1-l2", "b1-l1"],
];

export const RIGHT_PARALLEL_CONNECTION_ORDER = [["b1-k1", "k1-l1", "b1-l1", "k1-l2", "b1-l2"]];

export const RIGHT_COMBINED_CONNECTION_ORDER = [
  ["0-1", "2-3", "2-5", "4-7", "6-7", "8-9"],
  ["0-1", "2-3", "2-8", "4-5", "5-7", "6-9"],
  ["0-1", "2-5", "2-7", "3-6", "3-8", "4-9"],
];

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
