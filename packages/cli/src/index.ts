#!/usr/bin/env bun

import { generateCommand, listCommand } from "./commands";
import { ParseError, parseArgs } from "./parser";

const VERSION = "1.0.0";

function showHelp(): void {
  console.log(`
GGST 3on3 チーム画像生成ツール v${VERSION}

使い方:
  ggst-team generate [オプション]
  ggst-team list

コマンド:
  generate    チーム画像を生成します
  list        利用可能なキャラクター一覧を表示します

generateオプション:
  -t, --team <name>      チーム名 (必須)
  -m, --members <str>    メンバー情報 (必須)
                         形式: "P1:sol,P2:ky,P3:may"
  -o, --output <dir>     出力ディレクトリ (デフォルト: ./output)
  -l, --layout <type>    レイアウト: horizontal | vertical
  --width <px>           画像の幅
  --height <px>          画像の高さ

その他:
  -h, --help             ヘルプを表示
  -v, --version          バージョンを表示

例:
  ggst-team generate -t "チーム名" -m "Player1:sol,Player2:ky,Player3:may"
  ggst-team generate -t "My Team" -m "P1:ソル,P2:カイ,P3:メイ" -l vertical
  ggst-team list
`);
}

function showVersion(): void {
  console.log(`ggst-team v${VERSION}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.help) {
    showHelp();
    return;
  }

  if (args.version) {
    showVersion();
    return;
  }

  switch (args.command) {
    case "generate":
      await generateCommand(args);
      break;
    case "list":
      listCommand();
      break;
    default:
      showHelp();
      break;
  }
}

main().catch((error) => {
  if (error instanceof ParseError) {
    console.error(`引数エラー: ${error.message}`);
    console.error("ヘルプを表示するには --help を使用してください");
  } else {
    console.error("予期しないエラーが発生しました:", error);
  }
  process.exit(1);
});
