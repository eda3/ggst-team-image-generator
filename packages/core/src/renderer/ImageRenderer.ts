import { readFile } from "node:fs/promises";
import path from "node:path";
import { type SKRSContext2D, createCanvas, loadImage } from "@napi-rs/canvas";
import { characterRegistry } from "../registry/CharacterRegistry";
import type { RenderOptions, RenderOptionsInput, RenderResult } from "../types/render";
import { DEFAULT_RENDER_OPTIONS } from "../types/render";
import type { Team } from "../types/team";

export class ImageRenderer {
  private assetsBasePath: string;

  constructor(assetsBasePath: string = process.cwd()) {
    this.assetsBasePath = assetsBasePath;
  }

  async render(team: Team, options: RenderOptionsInput = {}): Promise<RenderResult> {
    // undefinedの値を除去してからマージする
    const cleanedOptions: Partial<RenderOptions> = {};
    for (const key of Object.keys(options) as (keyof RenderOptionsInput)[]) {
      if (options[key] !== undefined) {
        (cleanedOptions as Record<string, unknown>)[key] = options[key];
      }
    }
    const opts: RenderOptions = { ...DEFAULT_RENDER_OPTIONS, ...cleanedOptions };

    const { width, height } = opts;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    await this.drawBackground(ctx, width, height, opts);

    this.drawTeamName(ctx, team.name, width, height, opts);
    await this.drawMembers(ctx, team, width, height, opts);

    const buffer = canvas.toBuffer("image/png");

    return {
      buffer,
      width,
      height,
    };
  }

  private async drawBackground(
    ctx: SKRSContext2D,
    canvasWidth: number,
    canvasHeight: number,
    opts: RenderOptions
  ): Promise<void> {
    if (opts.backgroundImage) {
      try {
        const backgroundPath = path.isAbsolute(opts.backgroundImage)
          ? opts.backgroundImage
          : path.join(this.assetsBasePath, opts.backgroundImage);
        const imageBuffer = await readFile(backgroundPath);
        const bgImage = await loadImage(imageBuffer);
        ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
      } catch (error) {
        console.warn(`Failed to load background image: ${opts.backgroundImage}`, error);
        ctx.fillStyle = opts.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      ctx.fillStyle = opts.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  private drawTeamName(
    ctx: SKRSContext2D,
    teamName: string,
    canvasWidth: number,
    canvasHeight: number,
    opts: RenderOptions
  ): void {
    ctx.fillStyle = opts.fontColor;
    ctx.font = `bold ${opts.fontSize + 8}px "${opts.fontFamily}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const teamNameY = canvasHeight * 0.08;
    ctx.fillText(teamName, canvasWidth / 2, teamNameY);
  }

  private async drawMembers(
    ctx: SKRSContext2D,
    team: Team,
    canvasWidth: number,
    canvasHeight: number,
    opts: RenderOptions
  ): Promise<void> {
    const memberCount = team.members.length;
    const isHorizontal = opts.layout === "horizontal";

    const teamNameHeight = (opts.fontSize + 8) * 1.5;
    const startY = canvasHeight * 0.08 + teamNameHeight + 40;
    const bottomPadding = canvasHeight * 0.1;
    const availableHeight = canvasHeight - startY - bottomPadding;
    const sidePadding = canvasWidth * 0.05;
    const availableWidth = canvasWidth - sidePadding * 2;

    for (let i = 0; i < memberCount; i++) {
      const member = team.members[i];
      const character = characterRegistry.getCharacterById(member.characterId);

      if (!character) continue;

      let x: number;
      let y: number;
      let cellWidth: number;
      let cellHeight: number;

      if (isHorizontal) {
        cellWidth = availableWidth / memberCount;
        cellHeight = availableHeight;
        x = sidePadding + i * cellWidth + cellWidth / 2;
        y = startY;
      } else {
        cellWidth = availableWidth;
        cellHeight = availableHeight / memberCount;
        x = canvasWidth / 2;
        y = startY + i * cellHeight;
      }

      try {
        const iconPath = path.join(this.assetsBasePath, character.iconPath);
        const image = await loadImage(iconPath);

        const iconSize = Math.min(cellWidth * 0.6, cellHeight * 0.6, 400);
        const iconX = x - iconSize / 2;
        const iconY = y + (cellHeight - iconSize) * 0.3;

        ctx.drawImage(image, iconX, iconY, iconSize, iconSize);

        ctx.fillStyle = opts.fontColor;
        ctx.font = `${opts.fontSize - 4}px "${opts.fontFamily}"`;
        ctx.textAlign = "center";
        ctx.fillText(member.playerName, x, iconY + iconSize + 15);
      } catch {
        ctx.fillStyle = "#666666";
        ctx.fillRect(x - 40, y + 10, 80, 80);

        ctx.fillStyle = opts.fontColor;
        ctx.font = `${opts.fontSize - 4}px "${opts.fontFamily}"`;
        ctx.textAlign = "center";
        ctx.fillText(member.playerName, x, y + 105);
      }
    }
  }
}
