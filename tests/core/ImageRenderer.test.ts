import { describe, expect, test } from "bun:test";
import { ImageRenderer } from "../../packages/core/src/renderer/ImageRenderer";
import { DEFAULT_RENDER_OPTIONS } from "../../packages/core/src/types/render";
import type { Team } from "../../packages/core/src/types/team";

// PNGマジックナンバー
const PNG_MAGIC_NUMBER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// テスト用のモックチームを作成
function createMockTeam(name = "テストチーム"): Team {
  return {
    name,
    members: [
      { playerName: "Player1", characterId: "sol" },
      { playerName: "Player2", characterId: "ky" },
      { playerName: "Player3", characterId: "may" },
    ],
  };
}

describe("ImageRenderer", () => {
  describe("基本的な画像生成", () => {
    test("horizontalレイアウトで画像を生成できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { layout: "horizontal" });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("verticalレイアウトで画像を生成できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { layout: "vertical" });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("生成されたバッファがPNG形式である（マジックナンバー確認）", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team);

      const header = result.buffer.subarray(0, 8);
      expect(header).toEqual(PNG_MAGIC_NUMBER);
    });

    test("生成されたバッファのサイズが0より大きい", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team);

      expect(result.buffer.length).toBeGreaterThan(0);
    });
  });

  describe("カスタムサイズ", () => {
    test("指定した幅で画像を生成できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const customWidth = 1200;
      const result = await renderer.render(team, { width: customWidth });

      expect(result.width).toBe(customWidth);
    });

    test("指定した高さで画像を生成できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const customHeight = 600;
      const result = await renderer.render(team, { height: customHeight });

      expect(result.height).toBe(customHeight);
    });

    test("デフォルトサイズ（1920x1080）で生成できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });

    test("幅と高さを同時に指定できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { width: 1000, height: 500 });

      expect(result.width).toBe(1000);
      expect(result.height).toBe(500);
    });
  });

  describe("カスタムスタイル", () => {
    test("背景色を指定できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { backgroundColor: "#ff0000" });

      // 画像が正常に生成されることを確認
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("フォントサイズを指定できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { fontSize: 32 });

      // 画像が正常に生成されることを確認
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("フォントカラーを指定できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { fontColor: "#00ff00" });

      // 画像が正常に生成されることを確認
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("複数のスタイルオプションを同時に指定できる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, {
        backgroundColor: "#000000",
        fontColor: "#ffffff",
        fontSize: 28,
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });
  });

  describe("エラーケース", () => {
    test("キャラクター画像が見つからない場合、プレースホルダーを表示する", async () => {
      // 存在しないパスを指定
      const renderer = new ImageRenderer("/nonexistent/path");
      const team = createMockTeam();

      // エラーを投げずにプレースホルダーで描画される
      const result = await renderer.render(team);
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("空のメンバーリストでも画像が生成される", async () => {
      const renderer = new ImageRenderer();
      // membersを空配列にキャストして無理やり渡す（エッジケース）
      const team = {
        name: "EmptyTeam",
        members: [] as unknown as Team["members"],
      };

      const result = await renderer.render(team);
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    test("長いチーム名でも画像が生成される", async () => {
      const renderer = new ImageRenderer();
      const longName = "非常に長いチーム名".repeat(10);
      const team = createMockTeam(longName);

      const result = await renderer.render(team);
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    test("長いプレイヤー名でも画像が生成される", async () => {
      const renderer = new ImageRenderer();
      const team: Team = {
        name: "テストチーム",
        members: [
          { playerName: "VeryLongPlayerName".repeat(5), characterId: "sol" },
          { playerName: "Player2", characterId: "ky" },
          { playerName: "Player3", characterId: "may" },
        ],
      };

      const result = await renderer.render(team);
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });
  });

  describe("RenderResult", () => {
    test("RenderResultにbuffer, width, heightが含まれる", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team);

      expect(result).toHaveProperty("buffer");
      expect(result).toHaveProperty("width");
      expect(result).toHaveProperty("height");
    });

    test("widthとheightが指定値と一致する", async () => {
      const renderer = new ImageRenderer();
      const team = createMockTeam();
      const result = await renderer.render(team, { width: 640, height: 480 });

      expect(result.width).toBe(640);
      expect(result.height).toBe(480);
    });
  });
});

describe("DEFAULT_RENDER_OPTIONS", () => {
  test("DEFAULT_RENDER_OPTIONSが正しいデフォルト値を持つ", () => {
    expect(DEFAULT_RENDER_OPTIONS).toBeDefined();
  });

  test('layoutのデフォルトは"horizontal"', () => {
    expect(DEFAULT_RENDER_OPTIONS.layout).toBe("horizontal");
  });

  test("widthのデフォルトは1920", () => {
    expect(DEFAULT_RENDER_OPTIONS.width).toBe(1920);
  });

  test("heightのデフォルトは1080", () => {
    expect(DEFAULT_RENDER_OPTIONS.height).toBe(1080);
  });

  test('backgroundColorのデフォルトは"#1a1a2e"', () => {
    expect(DEFAULT_RENDER_OPTIONS.backgroundColor).toBe("#1a1a2e");
  });

  test('fontColorのデフォルトは"#ffffff"', () => {
    expect(DEFAULT_RENDER_OPTIONS.fontColor).toBe("#ffffff");
  });

  test("fontSizeのデフォルトは48", () => {
    expect(DEFAULT_RENDER_OPTIONS.fontSize).toBe(48);
  });

  test('fontFamilyのデフォルトは"Noto Sans JP"', () => {
    expect(DEFAULT_RENDER_OPTIONS.fontFamily).toBe("Noto Sans JP");
  });
});
