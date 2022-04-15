import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Image } from "@babylonjs/gui/2D/controls/image";
export declare const createNumberWiresInfo: (advancedTexture: AdvancedDynamicTexture) => TextBlock;
export declare const createDiagramInfo: (advancedTexture: AdvancedDynamicTexture) => {
    imageSerial: Image;
    imageParallel: Image;
};
