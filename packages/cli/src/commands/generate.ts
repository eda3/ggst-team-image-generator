import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageRenderer, TeamBuilder } from "@ggst-team/core";
import type { ParsedArgs } from "../parser";

export async function generateCommand(args: ParsedArgs): Promise<void> {
  if (!args.teamName) {
    console.error("エラー: チーム名 (-t) は必須です");
    process.exit(1);
  }

  if (!args.members) {
    console.error("エラー: メンバー情報 (-m) は必須です");
    process.exit(1);
  }

  try {
    const builder = new TeamBuilder();
    const team = builder.setTeamName(args.teamName).parseMembersString(args.members).build();

    const assetsPath = path.join(process.cwd(), "assets");
    const renderer = new ImageRenderer(assetsPath);

    const result = await renderer.render(team, {
      layout: args.layout || "horizontal",
      width: args.width,
      height: args.height,
      backgroundImage: args.backgroundImage,
    });

    const outputDir = args.output || path.join(process.cwd(), "output");
    await mkdir(outputDir, { recursive: true });

    const timestamp = Date.now();
    const filename = `${team.name.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "_")}_${timestamp}.png`;
    const outputPath = path.join(outputDir, filename);

    await writeFile(outputPath, result.buffer);

    console.log(`✓ 画像を生成しました: ${outputPath}`);
    console.log(`  サイズ: ${result.width}x${result.height}px`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`エラー: ${error.message}`);
    } else {
      console.error("予期しないエラーが発生しました");
    }
    process.exit(1);
  }
}
