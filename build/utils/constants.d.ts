import { Vector3 } from "@babylonjs/core/Maths/math.vector";
export declare const DEFAULT_COLOR_BORDER = "#878787";
export declare const HOVER_COLOR_BORDER = "#FFFFFF";
export declare const BACK_TITLE_COLOR = "#2F6EFF";
export declare const SERIES_CONNECTION: {
    type: string;
    position: Vector3;
}[];
export declare const COMBINED_CONNECTION: Vector3[];
export declare const RIGHT_SERIES_CONNECTION_ORDER: string[][];
export declare const RIGHT_PARALLEL_CONNECTION_ORDER: string[][];
export declare const RIGHT_COMBINED_CONNECTION_ORDER: string[][];
export declare const BUTTON_CONFIG: {
    defaultColor: {
        background: string;
        color: string;
    };
    enterColor: {
        background: string;
        color: string;
    };
    outColor: {
        background: string;
        color: string;
    };
    downColor: {
        background: string;
        color: string;
    };
    upColor: {
        background: string;
        color: string;
    };
    pressedColor: {
        background: string;
        color: string;
    };
    textureColor: string;
};
