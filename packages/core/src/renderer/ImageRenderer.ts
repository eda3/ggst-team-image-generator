import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "node:path";
import { characterRegistry } from "../registry/CharacterRegistry";
import type { RenderOptions, RenderResult } from "../types/render";
import { DEFAULT_RENDER_OPTIONS } from "../types/render";
import type { Team } from "../types/team";

export class ImageRenderer {
  private assetsBasePath: string;

  constructor(assetsBasePath: string = process.cwd()) {
    this.assetsBasePath = assetsBasePath;
  }

  async render(team: Team, options: Partial<RenderOptions> = {}): Promise<RenderResult> {
    const opts: RenderOptions = { ...DEFAULT_RENDER_OPTIONS, ...options };

    const width = opts.width!;
    const height = opts.height!;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = opts.backgroundColor!;
    ctx.fillRect(0, 0, width, height);

    await this.drawTeamName(ctx, team.name, width, opts);
    await this.drawMembers(ctx, team, width, height, opts);

    const buffer = canvas.toBuffer("image/png");

    return {
      buffer,
      width,
      height,
    };
  }

  private async drawTeamName(
    ctx: ReturnType<typeof createCanvas>["prototype"]["getContext"],
    teamName: string,
    canvasWidth: number,
    opts: RenderOptions
  ): Promise<void> {
    ctx.fillStyle = opts.fontColor!;
    ctx.font = `bold ${opts.fontSize! + 8}px "${opts.fontFamily}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(teamName, canvasWidth / 2, 20);
  }

  private async drawMembers(
    ctx: ReturnType<typeof createCanvas>["prototype"]["getContext"],
    team: Team,
    canvasWidth: number,
    canvasHeight: number,
    opts: RenderOptions
  ): Promise<void> {
    const memberCount = team.members.length;
    const isHorizontal = opts.layout === "horizontal";

    const startY = 70;
    const availableHeight = canvasHeight - startY - 20;
    const availableWidth = canvasWidth - 40;

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
        x = 20 + i * cellWidth + cellWidth / 2;
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

        const iconSize = Math.min(cellWidth * 0.6, cellHeight * 0.5, 100);
        const iconX = x - iconSize / 2;
        const iconY = y + 10;

        ctx.drawImage(image, iconX, iconY, iconSize, iconSize);

        ctx.fillStyle = opts.fontColor!;
        ctx.font = `${opts.fontSize! - 4}px "${opts.fontFamily}"`;
        ctx.textAlign = "center";
        ctx.fillText(member.playerName, x, iconY + iconSize + 15);

        ctx.font = `${opts.fontSize! - 6}px "${opts.fontFamily}"`;
        ctx.fillStyle = "#cccccc";
        ctx.fillText(character.nameJa, x, iconY + iconSize + 40);
      } catch {
        ctx.fillStyle = "#666666";
        ctx.fillRect(x - 40, y + 10, 80, 80);

        ctx.fillStyle = opts.fontColor!;
        ctx.font = `${opts.fontSize! - 4}px "${opts.fontFamily}"`;
        ctx.textAlign = "center";
        ctx.fillText(member.playerName, x, y + 105);

        ctx.font = `${opts.fontSize! - 6}px "${opts.fontFamily}"`;
        ctx.fillStyle = "#cccccc";
        ctx.fillText(character.nameJa, x, y + 130);
      }
    }
  }
}
