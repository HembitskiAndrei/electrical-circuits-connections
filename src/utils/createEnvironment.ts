import type { MainScene } from "../scenes/MainScene";

export const createEnvironment = (scene: MainScene) => {
  const environmentTask = scene.assetsManager.addCubeTextureTask("environmentTask", "./assets/sky/environment.env");
  environmentTask.onSuccess = task => {
    scene.environmentTexture = task.texture;
    scene.createDefaultLight();
    scene.createDefaultEnvironment({
      createSkybox: false,
      createGround: false,
    });
  };
};
