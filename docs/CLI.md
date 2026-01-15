# CLI設計

## 1. コマンド一覧

```bash
# ヘルプ
bun run ggst-team --help

# 単一チーム画像生成
bun run ggst-team generate \
  --team "チーム名" \
  --members "Player1:sol,Player2:ky,Player3:may" \
  --output ./output/team-a.png \
  --layout horizontal \
  --template default

# 一括生成
bun run ggst-team batch \
  --input ./teams.yaml \
  --output-dir ./output/ \
  --template default

# キャラクター一覧表示
bun run ggst-team list-characters

# 対話モード
bun run ggst-team interactive

# ビルド済みバイナリとして実行（Phase 2以降）
./dist/ggst-team generate --team "チームA" ...
```

## 2. Bun.argv パーサー実装

```typescript
// packages/cli/src/parser.ts

interface ParsedArgs {
  command: 'generate' | 'batch' | 'list-characters' | 'interactive' | 'help';
  options: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  // Bun.argvは [bunPath, scriptPath, ...args] の形式
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    return { command: 'help', options: {} };
  }

  const command = args[0] as ParsedArgs['command'];
  const options: Record<string, string | boolean> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];

      if (next && !next.startsWith('-')) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const next = args[i + 1];

      if (next && !next.startsWith('-')) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return { command, options };
}

// ショートオプションのマッピング
export const SHORT_OPTIONS: Record<string, string> = {
  t: 'team',
  m: 'members',
  o: 'output',
  l: 'layout',
  i: 'input',
  d: 'output-dir',
  h: 'help',
};
```

## 3. エントリーポイント実装

```typescript
// packages/cli/src/index.ts

import { parseArgs } from './parser';
import { generate } from './commands/generate';
import { batch } from './commands/batch';
import { listCharacters } from './commands/list-characters';
import { interactive } from './commands/interactive';

const HELP_TEXT = `
🎮 GGST 3on3 チーム画像生成ツール

Usage:
  bun run ggst-team <command> [options]

Commands:
  generate          単一チーム画像を生成
  batch             複数チーム画像を一括生成
  list-characters   利用可能なキャラクター一覧を表示
  interactive       対話モードで実行

Options (generate):
  -t, --team <name>       チーム名（必須）
  -m, --members <list>    メンバー情報 "Player:Char,..." 形式（必須）
  -o, --output <path>     出力ファイルパス
  -l, --layout <type>     レイアウト: horizontal|vertical
  --template <id>         テンプレートID
  --size <preset>         サイズ: twitter|discord|custom

Options (batch):
  -i, --input <path>      入力ファイル（JSON/YAML）
  -d, --output-dir <dir>  出力ディレクトリ

Examples:
  bun run ggst-team generate -t "チームA" -m "Player1:sol,Player2:ky,Player3:may"
  bun run ggst-team batch -i teams.yaml -d ./output/
`;

async function main() {
  const { command, options } = parseArgs(Bun.argv);

  switch (command) {
    case 'generate':
      await generate(options);
      break;
    case 'batch':
      await batch(options);
      break;
    case 'list-characters':
      await listCharacters();
      break;
    case 'interactive':
      await interactive();
      break;
    case 'help':
    default:
      console.log(HELP_TEXT);
      break;
  }
}

main().catch((error) => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});
```

## 4. コマンド詳細

### generate コマンド

```
bun run ggst-team generate [options]

オプション:
  -t, --team <name>           チーム名（必須）
  -m, --members <list>        メンバー情報 "Player:Char,..." 形式（必須）
  -o, --output <path>         出力ファイルパス（デフォルト: ./output/<team>.png）
  -l, --layout <type>         レイアウト: horizontal|vertical（デフォルト: horizontal）
  --template <id>             テンプレートID（デフォルト: default）
  --size <preset>             サイズプリセット: twitter|discord|custom
  --width <px>                カスタム幅（--size custom時）
  --height <px>               カスタム高さ（--size custom時）
  --bg-color <color>          背景色（例: #1a1a2e）
```

### batch コマンド

```
bun run ggst-team batch [options]

オプション:
  -i, --input <path>          入力ファイル（JSON/YAML）（必須）
  -d, --output-dir <path>     出力ディレクトリ（デフォルト: ./output/）
  --template <id>             テンプレートID
  --parallel <n>              並列処理数（デフォルト: 4）
```

## 5. インタラクティブモード

```
$ bun run ggst-team interactive

🎮 GGST 3on3 チーム画像生成ツール

? チーム名を入力してください: チームA

? 1人目のプレイヤー名: Player1
? 1人目のキャラクター (検索): sol
  → Sol Badguy を選択

? 2人目のプレイヤー名: Player2
? 2人目のキャラクター (検索): ky
  → Ky Kiske を選択

? 3人目のプレイヤー名: Player3
? 3人目のキャラクター (検索): may
  → May を選択

? レイアウトを選択:
  ❯ 横並び (horizontal)
    縦並び (vertical)

? 出力ファイル名 (output/team-a.png):

✅ 生成完了: output/team-a.png（処理時間: 234ms）
```

## 6. スタンドアロンバイナリ生成

```bash
# 単一実行ファイルにコンパイル
bun build packages/cli/src/index.ts --compile --outfile dist/ggst-team

# 生成されたバイナリを直接実行（Bunインストール不要）
./dist/ggst-team generate -t "チームA" -m "Player1:sol,Player2:ky,Player3:may"
```
