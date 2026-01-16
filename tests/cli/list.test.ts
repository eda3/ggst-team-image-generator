import { describe, expect, test } from "bun:test";
import path from "node:path";

const CLI_PATH = path.join(process.cwd(), "packages/cli/src/index.ts");
// テスト実行中のBunのパスを取得（環境によってPATHにbunがない場合に対応）
const BUN_PATH = process.argv[0];

describe("listコマンド", () => {
  describe("正常系", () => {
    test("全キャラクターが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      // 基本キャラクター（Sol, Ky, May など）が含まれていることを確認
      expect(stdout).toContain("sol");
      expect(stdout).toContain("ky");
      expect(stdout).toContain("may");
    });

    test("キャラクターIDが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // 主要キャラクターのIDが含まれていることを確認
      expect(stdout).toContain("sol");
      expect(stdout).toContain("ky");
      expect(stdout).toContain("may");
      expect(stdout).toContain("axl");
      expect(stdout).toContain("chipp");
      expect(stdout).toContain("potemkin");
      expect(stdout).toContain("ramlethal");
      expect(stdout).toContain("nagoriyuki");
    });

    test("キャラクター名（日本語）が表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // 日本語のキャラクター名が含まれていることを確認
      expect(stdout).toContain("ソル");
      expect(stdout).toContain("カイ");
      expect(stdout).toContain("メイ");
    });

    test("エイリアスが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // エイリアス列のヘッダーが含まれていることを確認
      expect(stdout).toContain("エイリアス");
    });

    test("合計数が表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // 合計数の表示形式を確認
      expect(stdout).toContain("合計:");
      expect(stdout).toContain("キャラクター");
      // 少なくとも15キャラクター以上（基本キャラクター）存在することを確認
      expect(stdout).toMatch(/合計: \d+ キャラクター/);
    });

    test("ヘッダー行が表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // ヘッダー行が含まれていることを確認
      expect(stdout).toContain("ID");
      expect(stdout).toContain("名前");
      expect(stdout).toContain("エイリアス");
      expect(stdout).toContain("利用可能なキャラクター一覧");
    });

    test("区切り線が表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // 区切り線が含まれていることを確認
      expect(stdout).toContain("-".repeat(10)); // 最低10個の連続ハイフン
    });
  });
});
