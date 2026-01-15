import { describe, expect, test } from "bun:test";
import { TeamBuilder, TeamBuilderError } from "@ggst-team/core";

describe("TeamBuilder", () => {
  describe("基本的なチーム構築", () => {
    test("3人のメンバーでチームを構築できる", () => {
      const builder = new TeamBuilder();
      const team = builder
        .setTeamName("テストチーム")
        .addMember("Player1", "sol")
        .addMember("Player2", "ky")
        .addMember("Player3", "may")
        .build();

      expect(team.name).toBe("テストチーム");
      expect(team.members.length).toBe(3);
      expect(team.members[0].playerName).toBe("Player1");
      expect(team.members[0].characterId).toBe("sol");
    });

    test("エイリアスでキャラクターを指定できる", () => {
      const builder = new TeamBuilder();
      const team = builder
        .setTeamName("エイリアスチーム")
        .addMember("P1", "ソル")
        .addMember("P2", "カイ")
        .addMember("P3", "メイ")
        .build();

      expect(team.members[0].characterId).toBe("sol");
      expect(team.members[1].characterId).toBe("ky");
      expect(team.members[2].characterId).toBe("may");
    });

    test("同じキャラクターを複数人が使用できる", () => {
      const builder = new TeamBuilder();
      const team = builder
        .setTeamName("ソル3人チーム")
        .addMember("P1", "sol")
        .addMember("P2", "sol")
        .addMember("P3", "sol")
        .build();

      expect(team.members[0].characterId).toBe("sol");
      expect(team.members[1].characterId).toBe("sol");
      expect(team.members[2].characterId).toBe("sol");
    });
  });

  describe("parseMembersString", () => {
    test("文字列からメンバーをパースできる", () => {
      const builder = new TeamBuilder();
      const team = builder
        .setTeamName("パーステスト")
        .parseMembersString("Player1:sol,Player2:ky,Player3:may")
        .build();

      expect(team.members.length).toBe(3);
      expect(team.members[0].playerName).toBe("Player1");
      expect(team.members[0].characterId).toBe("sol");
      expect(team.members[1].playerName).toBe("Player2");
      expect(team.members[1].characterId).toBe("ky");
    });

    test("空白を含む文字列をパースできる", () => {
      const builder = new TeamBuilder();
      const team = builder
        .setTeamName("空白テスト")
        .parseMembersString("  Player1 : sol , Player2 : ky , Player3 : may  ")
        .build();

      expect(team.members[0].playerName).toBe("Player1");
      expect(team.members[0].characterId).toBe("sol");
    });

    test("日本語のエイリアスを使用できる", () => {
      const builder = new TeamBuilder();
      const team = builder
        .setTeamName("日本語テスト")
        .parseMembersString("選手1:ソル,選手2:カイ,選手3:メイ")
        .build();

      expect(team.members[0].characterId).toBe("sol");
      expect(team.members[1].characterId).toBe("ky");
      expect(team.members[2].characterId).toBe("may");
    });
  });

  describe("エラーケース", () => {
    test("チーム名なしでビルドするとエラー", () => {
      const builder = new TeamBuilder();
      builder.addMember("P1", "sol").addMember("P2", "ky").addMember("P3", "may");

      expect(() => builder.build()).toThrow(TeamBuilderError);
      expect(() => builder.build()).toThrow("チーム名が設定されていません");
    });

    test("空のチーム名はエラー", () => {
      const builder = new TeamBuilder();
      expect(() => builder.setTeamName("")).toThrow(TeamBuilderError);
      expect(() => builder.setTeamName("   ")).toThrow("チーム名は必須です");
    });

    test("3人未満でビルドするとエラー", () => {
      const builder = new TeamBuilder();
      builder.setTeamName("不完全チーム").addMember("P1", "sol");

      expect(() => builder.build()).toThrow(TeamBuilderError);
      expect(() => builder.build()).toThrow("チームメンバーは3人必要です");
    });

    test("4人目を追加しようとするとエラー", () => {
      const builder = new TeamBuilder();
      builder
        .setTeamName("4人チーム")
        .addMember("P1", "sol")
        .addMember("P2", "ky")
        .addMember("P3", "may");

      expect(() => builder.addMember("P4", "axl")).toThrow(TeamBuilderError);
      expect(() => builder.addMember("P4", "axl")).toThrow("チームメンバーは3人までです");
    });

    test("存在しないキャラクターを指定するとエラー", () => {
      const builder = new TeamBuilder();
      expect(() => builder.setTeamName("無効チーム").addMember("P1", "invalid_character")).toThrow(
        TeamBuilderError
      );
      expect(() => builder.setTeamName("無効チーム").addMember("P1", "invalid_character")).toThrow(
        'キャラクター "invalid_character" が見つかりません'
      );
    });

    test("空のプレイヤー名はエラー", () => {
      const builder = new TeamBuilder();
      expect(() => builder.setTeamName("テスト").addMember("", "sol")).toThrow(TeamBuilderError);
      expect(() => builder.setTeamName("テスト").addMember("", "sol")).toThrow(
        "プレイヤー名は必須です"
      );
    });

    test("不正なメンバー形式はエラー", () => {
      const builder = new TeamBuilder();
      expect(() => builder.setTeamName("テスト").parseMembersString("invalid_format")).toThrow(
        TeamBuilderError
      );
      expect(() => builder.setTeamName("テスト").parseMembersString("invalid_format")).toThrow(
        "メンバー形式が不正です"
      );
    });
  });

  describe("reset", () => {
    test("resetでビルダーの状態がクリアされる", () => {
      const builder = new TeamBuilder();
      builder
        .setTeamName("テスト")
        .addMember("P1", "sol")
        .addMember("P2", "ky")
        .addMember("P3", "may");

      builder.reset();

      expect(() => builder.build()).toThrow("チーム名が設定されていません");
    });
  });

  describe("メソッドチェーン", () => {
    test("全てのメソッドがthisを返す", () => {
      const builder = new TeamBuilder();

      expect(builder.setTeamName("テスト")).toBe(builder);
      expect(builder.addMember("P1", "sol")).toBe(builder);
      expect(builder.reset()).toBe(builder);
    });
  });
});
