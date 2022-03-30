import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Curve3 } from "@babylonjs/core/Maths/math.path";

export const curveWay = (path: Vector3[], delta: Vector3[]) => {
  let catmullRom = Curve3.CreateCatmullRomSpline(path, 4);
  const points = catmullRom.getPoints();
  points.forEach((point, index) => {
    if (index !== 0 && index !== points.length - 1) {
      point.addInPlace(delta[index].scale(0.5));
    }
  });
  return Curve3.CreateCatmullRomSpline(points, 60).getPoints();
};
