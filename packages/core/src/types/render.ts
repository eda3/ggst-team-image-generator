export type LayoutType = "horizontal" | "vertical";

export interface RenderOptionsInput {
  layout?: LayoutType;
  width?: number;
  height?: number;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
}

export interface RenderOptions {
  layout: LayoutType;
  width: number;
  height: number;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
}

export interface RenderResult {
  buffer: Buffer;
  width: number;
  height: number;
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  layout: "horizontal",
  width: 800,
  height: 300,
  backgroundColor: "#1a1a2e",
  fontFamily: "Noto Sans JP",
  fontSize: 24,
  fontColor: "#ffffff",
};
