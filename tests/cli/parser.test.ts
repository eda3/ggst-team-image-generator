import { describe, expect, test } from "bun:test";
import { ParseError, parseArgs } from "../../packages/cli/src/parser";

describe("parseArgs", () => {
  describe("コマンドのパース", () => {
    test("generateコマンドをパースできる", () => {
      const args = parseArgs(["node", "script", "generate"]);
      expect(args.command).toBe("generate");
    });

    test("listコマンドをパースできる", () => {
      const args = parseArgs(["node", "script", "list"]);
      expect(args.command).toBe("list");
    });

    test("コマンドがない場合は空文字", () => {
      const args = parseArgs(["node", "script"]);
      expect(args.command).toBe("");
    });
  });

  describe("フラグのパース", () => {
    test("-h でhelpがtrueになる", () => {
      const args = parseArgs(["node", "script", "-h"]);
      expect(args.help).toBe(true);
    });

    test("--help でhelpがtrueになる", () => {
      const args = parseArgs(["node", "script", "--help"]);
      expect(args.help).toBe(true);
    });

    test("-v でversionがtrueになる", () => {
      const args = parseArgs(["node", "script", "-v"]);
      expect(args.version).toBe(true);
    });

    test("--version でversionがtrueになる", () => {
      const args = parseArgs(["node", "script", "--version"]);
      expect(args.version).toBe(true);
    });
  });

  describe("オプションのパース", () => {
    test("-t でチーム名を指定できる", () => {
      const args = parseArgs(["node", "script", "generate", "-t", "TestTeam"]);
      expect(args.teamName).toBe("TestTeam");
    });

    test("--team でチーム名を指定できる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "--team",
        "TestTeam",
      ]);
      expect(args.teamName).toBe("TestTeam");
    });

    test("-m でメンバー情報を指定できる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "-m",
        "P1:sol,P2:ky,P3:may",
      ]);
      expect(args.members).toBe("P1:sol,P2:ky,P3:may");
    });

    test("--members でメンバー情報を指定できる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "--members",
        "P1:sol,P2:ky,P3:may",
      ]);
      expect(args.members).toBe("P1:sol,P2:ky,P3:may");
    });

    test("-o で出力ディレクトリを指定できる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "-o",
        "./custom-output",
      ]);
      expect(args.output).toBe("./custom-output");
    });

    test("-l でレイアウトを指定できる (horizontal)", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "-l",
        "horizontal",
      ]);
      expect(args.layout).toBe("horizontal");
    });

    test("-l でレイアウトを指定できる (vertical)", () => {
      const args = parseArgs(["node", "script", "generate", "-l", "vertical"]);
      expect(args.layout).toBe("vertical");
    });

    test("--width で幅を指定できる", () => {
      const args = parseArgs(["node", "script", "generate", "--width", "1200"]);
      expect(args.width).toBe(1200);
    });

    test("--height で高さを指定できる", () => {
      const args = parseArgs(["node", "script", "generate", "--height", "600"]);
      expect(args.height).toBe(600);
    });
  });

  describe("複数オプションの組み合わせ", () => {
    test("全オプションを組み合わせてパースできる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "-t",
        "MyTeam",
        "-m",
        "P1:sol,P2:ky,P3:may",
        "-o",
        "./out",
        "-l",
        "vertical",
        "--width",
        "1000",
        "--height",
        "500",
      ]);

      expect(args.command).toBe("generate");
      expect(args.teamName).toBe("MyTeam");
      expect(args.members).toBe("P1:sol,P2:ky,P3:may");
      expect(args.output).toBe("./out");
      expect(args.layout).toBe("vertical");
      expect(args.width).toBe(1000);
      expect(args.height).toBe(500);
    });
  });

  describe("エラーケース", () => {
    test("-t の後に値がないとエラー", () => {
      expect(() => parseArgs(["node", "script", "generate", "-t"])).toThrow(
        ParseError
      );
      expect(() => parseArgs(["node", "script", "generate", "-t"])).toThrow(
        "--team オプションには値が必要です"
      );
    });

    test("-t の後に別のオプションがあるとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "-t", "-m"])
      ).toThrow(ParseError);
      expect(() =>
        parseArgs(["node", "script", "generate", "-t", "-m"])
      ).toThrow("--team オプションには値が必要です");
    });

    test("-m の後に値がないとエラー", () => {
      expect(() => parseArgs(["node", "script", "generate", "-m"])).toThrow(
        ParseError
      );
    });

    test("-o の後に値がないとエラー", () => {
      expect(() => parseArgs(["node", "script", "generate", "-o"])).toThrow(
        ParseError
      );
    });

    test("-l の後に値がないとエラー", () => {
      expect(() => parseArgs(["node", "script", "generate", "-l"])).toThrow(
        ParseError
      );
    });

    test("-l に不正な値を指定するとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "-l", "invalid"])
      ).toThrow(ParseError);
      expect(() =>
        parseArgs(["node", "script", "generate", "-l", "invalid"])
      ).toThrow('"horizontal" または "vertical" を指定してください');
    });

    test("--width の後に値がないとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "--width"])
      ).toThrow(ParseError);
    });

    test("--width に数値以外を指定するとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "--width", "abc"])
      ).toThrow(ParseError);
      expect(() =>
        parseArgs(["node", "script", "generate", "--width", "abc"])
      ).toThrow("--width には数値を指定してください");
    });

    test("--width に0を指定するとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "--width", "0"])
      ).toThrow(ParseError);
      expect(() =>
        parseArgs(["node", "script", "generate", "--width", "0"])
      ).toThrow("--width には正の数値を指定してください");
    });

    test("--width に負の数を指定するとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "--width", "-100"])
      ).toThrow(ParseError);
    });

    test("--height に数値以外を指定するとエラー", () => {
      expect(() =>
        parseArgs(["node", "script", "generate", "--height", "abc"])
      ).toThrow(ParseError);
    });
  });

  describe("境界ケース", () => {
    test("空の引数配列", () => {
      const args = parseArgs([]);
      expect(args.command).toBe("");
    });

    test("不明なオプションは無視される", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "--unknown",
        "-t",
        "Team",
      ]);
      expect(args.teamName).toBe("Team");
    });

    test("日本語のチーム名を指定できる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "-t",
        "日本語チーム名",
      ]);
      expect(args.teamName).toBe("日本語チーム名");
    });

    test("スペースを含むチーム名を指定できる", () => {
      const args = parseArgs([
        "node",
        "script",
        "generate",
        "-t",
        "Team With Spaces",
      ]);
      expect(args.teamName).toBe("Team With Spaces");
    });
  });
});
