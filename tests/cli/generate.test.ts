import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const CLI_PATH = path.join(process.cwd(), "packages/cli/src/index.ts");
const TEST_OUTPUT_DIR = path.join(process.cwd(), "output/test-generate");
// テスト実行中のBunのパスを取得（環境によってPATHにbunがない場合に対応）
const BUN_PATH = process.argv[0];

// PNGマジックナンバー
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("generateコマンド", () => {
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

  describe("正常系", () => {
    test("有効な引数で画像ファイルが生成される", async () => {
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
          "-o",
          TEST_OUTPUT_DIR,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await result.exited;
      expect(exitCode).toBe(0);

      // 出力ディレクトリにファイルが存在することを確認
      const files = await Bun.file(TEST_OUTPUT_DIR).exists();
      expect(existsSync(TEST_OUTPUT_DIR)).toBe(true);

      // ディレクトリ内にPNGファイルがあることを確認
      const dirEntries = require("node:fs").readdirSync(TEST_OUTPUT_DIR);
      const pngFiles = dirEntries.filter((f: string) => f.endsWith(".png"));
      expect(pngFiles.length).toBeGreaterThan(0);
    });

    test("出力ディレクトリが存在しない場合は自動作成される", async () => {
      const newOutputDir = path.join(TEST_OUTPUT_DIR, "new-dir");

      // ディレクトリが存在しないことを確認
      expect(existsSync(newOutputDir)).toBe(false);

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "AutoCreateTest",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          newOutputDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await result.exited;
      expect(exitCode).toBe(0);

      // ディレクトリが自動作成されたことを確認
      expect(existsSync(newOutputDir)).toBe(true);
    });

    test("生成されたファイルがPNG形式である", async () => {
      const pngTestDir = path.join(TEST_OUTPUT_DIR, "png-test");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "PngTest",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          pngTestDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      await result.exited;

      const dirEntries = require("node:fs").readdirSync(pngTestDir);
      const pngFile = dirEntries.find((f: string) => f.endsWith(".png"));
      expect(pngFile).toBeDefined();

      const filePath = path.join(pngTestDir, pngFile);
      const fileBuffer = readFileSync(filePath);

      // PNGマジックナンバーを確認
      expect(fileBuffer.slice(0, 8).equals(PNG_MAGIC)).toBe(true);
    });
  });

  describe("出力確認", () => {
    test("成功時にファイルパスが出力される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "path-output-test");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "PathTest",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // ファイルパスが出力に含まれることを確認
      expect(stdout).toContain("画像を生成しました");
      expect(stdout).toContain(".png");
    });

    test("成功時に画像サイズが出力される", async () => {
      const outputDir = path.join(TEST_OUTPUT_DIR, "size-output-test");

      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "SizeTest",
          "-m",
          "P1:sol,P2:ky,P3:may",
          "-o",
          outputDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(result.stdout).text();
      await result.exited;

      // サイズ情報が出力に含まれることを確認
      expect(stdout).toContain("サイズ:");
      expect(stdout).toMatch(/\d+x\d+px/);
    });
  });

  describe("エラー系", () => {
    test("チーム名がない場合にエラーメッセージが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-m",
          "P1:sol,P2:ky,P3:may",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("チーム名");
    });

    test("メンバー情報がない場合にエラーメッセージが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "NoMembersTeam",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("メンバー情報");
    });

    test("無効なキャラクターIDでエラーメッセージが表示される", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          "-t",
          "InvalidCharTeam",
          "-m",
          "P1:invalid_char,P2:ky,P3:may",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stderr = await new Response(result.stderr).text();
      const exitCode = await result.exited;

      expect(exitCode).toBe(1);
      expect(stderr).toContain("エラー");
    });

    test("exit code 1で終了する", async () => {
      const result = await Bun.spawn({
        cmd: [
          BUN_PATH,
          "run",
          CLI_PATH,
          "generate",
          // チーム名もメンバー情報もなし
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await result.exited;
      expect(exitCode).toBe(1);
    });
  });
});
