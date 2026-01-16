import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const CLI_PATH = path.join(process.cwd(), "packages/cli/src/index.ts");
const TEST_OUTPUT_DIR = path.join(process.cwd(), "output/test-integration");
// テスト実行中のBunのパスを取得（環境によってPATHにbunがない場合に対応）
const BUN_PATH = process.argv[0];

describe("CLI統合テスト", () => {
  beforeAll(() => {
    // テスト用出力ディレクトリをクリーンアップ
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // テスト後のクリーンアップ
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  describe("E2Eテスト", () => {
    test("bun run dev generate で画像生成が成功する", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "IntegrationTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          TEST_OUTPUT_DIR,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
      expect(existsSync(TEST_OUTPUT_DIR)).toBe(true);

      // PNGファイルが生成されたことを確認
      const dirEntries = require("node:fs").readdirSync(TEST_OUTPUT_DIR);
      const pngFiles = dirEntries.filter((f: string) => f.endsWith(".png"));
      expect(pngFiles.length).toBeGreaterThan(0);
    });

    test("bun run dev list でキャラクター一覧が表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "list"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("利用可能なキャラクター一覧");
      expect(stdout).toContain("sol");
      expect(stdout).toContain("ky");
      expect(stdout).toContain("may");
      expect(stdout).toContain("合計:");
    });

    test("bun run dev --help でヘルプが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "--help"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("GGST 3on3 チーム画像生成ツール");
      expect(stdout).toContain("使い方:");
      expect(stdout).toContain("generate");
      expect(stdout).toContain("list");
      expect(stdout).toContain("-t, --team");
      expect(stdout).toContain("-m, --members");
      expect(stdout).toContain("-o, --output");
      expect(stdout).toContain("-l, --layout");
    });

    test("bun run dev --version でバージョンが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH, "--version"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("ggst-team v");
      // バージョン形式の確認 (例: v1.0.0)
      expect(stdout).toMatch(/v\d+\.\d+\.\d+/);
    });
  });

  describe("エラーハンドリング", () => {
    test("不正な引数でエラー終了する（exit code 1）", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          // チーム名なし、メンバー情報なし
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("エラー");
    });

    test("ParseErrorが適切にハンドリングされる - チーム名の値がない", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          // 値なし
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("引数エラー");
      expect(stderr).toContain("--help");
    });

    test("ParseErrorが適切にハンドリングされる - メンバー情報の値がない", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "TestTeam",
          "-m",
          // 値なし
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("引数エラー");
      expect(stderr).toContain("--help");
    });

    test("ParseErrorが適切にハンドリングされる - レイアウトに不正な値", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "TestTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-l",
          "invalid_layout",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("引数エラー");
      expect(stderr).toContain("--help");
    });

    test("ParseErrorが適切にハンドリングされる - widthに数値以外", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "TestTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "--width",
          "abc",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("引数エラー");
      expect(stderr).toContain("--help");
    });

    test("ParseErrorが適切にハンドリングされる - widthに0", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "TestTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "--width",
          "0",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("引数エラー");
      expect(stderr).toContain("--help");
    });

    test("ParseErrorが適切にハンドリングされる - widthに負の数", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "TestTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "--width",
          "-100",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("引数エラー");
      expect(stderr).toContain("--help");
    });
  });

  describe("レイアウトオプション", () => {
    test("horizontalレイアウトで画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "horizontal");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "HorizontalTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
          "-l",
          "horizontal",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
    });

    test("verticalレイアウトで画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "vertical");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "VerticalTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
          "-l",
          "vertical",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
    });
  });

  describe("サイズオプション", () => {
    test("カスタム幅で画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "custom-width");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "WidthTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
          "--width",
          "1024",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
      expect(stdout).toContain("1024x");
    });

    test("カスタム高さで画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "custom-height");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "HeightTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
          "--height",
          "600",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
      expect(stdout).toContain("x600px");
    });

    test("カスタム幅と高さで画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "custom-size");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "SizeTeam",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
          "--width",
          "1280",
          "--height",
          "720",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
      expect(stdout).toContain("1280x720px");
    });
  });

  describe("日本語サポート", () => {
    test("日本語のチーム名で画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "japanese-team");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "日本語チーム",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
    });

    test("日本語のキャラクターエイリアスで画像が生成される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "japanese-char");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "JapaneseCharTeam",
          "-m",
          "P1:ソル,P2:カイ,P3:メイ",
          "-o",
          outputDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("画像を生成しました");
    });
  });

  describe("コマンドなしの動作", () => {
    test("コマンドなしでヘルプが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [BUN_PATH, "run", CLI_PATH],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(0);
      expect(stdout).toContain("GGST 3on3 チーム画像生成ツール");
      expect(stdout).toContain("使い方:");
    });
  });
});
