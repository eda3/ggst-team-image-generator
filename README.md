# GGST 3on3 チーム画像生成ツール

Guilty Gear Strive（GGST）の3on3形式大会向けに、チームのキャラクター構成とチーム名を視覚的に表現した画像を自動生成するCLI/Webツール。

## 特徴

- **高速生成**: Bunランタイムによる高速な画像生成
- **柔軟なキャラクター指定**: キャラクターID、日本語名、エイリアスに対応
- **カスタマイズ可能**: レイアウト、サイズ、背景、フォントなど細かく調整可能
- **大会名表示**: 画像上部に大会名を追加可能
- **型安全**: TypeScript strict modeによる堅牢な実装
- **モノレポ構成**: core/cli/webで責務を分離し、将来の拡張に対応

## 目次

- [機能](#機能)
- [インストール](#インストール)
- [使い方](#使い方)
  - [基本的な使い方](#基本的な使い方)
  - [コマンド一覧](#コマンド一覧)
  - [オプション詳細](#オプション詳細)
  - [使用例](#使用例)
- [対応キャラクター](#対応キャラクター)
- [プロジェクト構造](#プロジェクト構造)
- [開発](#開発)
  - [環境構築](#環境構築)
  - [開発コマンド](#開発コマンド)
  - [テスト](#テスト)
- [カスタマイズ](#カスタマイズ)
- [ドキュメント](#ドキュメント)
- [ライセンス](#ライセンス)

## 機能

### Phase 1: 基本機能（実装済み ✅）

- ✅ 単一チーム画像生成（PNG形式）
- ✅ レイアウト選択（横並び/縦並び）
- ✅ 画像カスタマイズ（背景色、背景画像、サイズ、フォント）
- ✅ 大会名表示機能
- ✅ キャラクター検索（ID/日本語名/エイリアス）
- ✅ キャラクター一覧表示
- ✅ バリデーション・エラーハンドリング

### Phase 2-4: 今後の拡張予定

- [ ] 一括生成（JSON/YAML入力）
- [ ] テンプレートシステム
- [ ] Webアプリケーション（React + Tailwind CSS）
- [ ] 対戦カード画像生成（2チーム対比表示）
- [ ] Discord Bot統合
- [ ] start.gg API連携

## インストール

### 必要要件

- **Bun** v1.1以上 ([インストール方法](https://bun.sh/))
- **PowerShell**（Windows環境）

### セットアップ

```powershell
# リポジトリをクローン
git clone <repository-url>
cd ggst-team-image-generator

# 依存関係をインストール
bun install
```

### ビルド（オプション）

```powershell
# Bunバイナリとしてビルド
bun run build

# スタンドアロン実行可能ファイルとして生成
bun build packages/cli/src/index.ts --compile --outfile dist/ggst-team
```

## 使い方

### 基本的な使い方

```powershell
# 開発モード
bun run dev generate -t "チーム名" -m "P1:sol,P2:ky,P3:may"

# ビルド後
./dist/ggst-team generate -t "チーム名" -m "P1:sol,P2:ky,P3:may"
```

### コマンド一覧

#### `generate` - チーム画像生成

チームのキャラクター構成画像を生成します。

```powershell
bun run dev generate [オプション]
```

**必須オプション:**

- `-t, --team <name>` - チーム名
- `-m, --members <str>` - メンバー情報（フォーマット: `"P1:キャラ,P2:キャラ,P3:キャラ"`）

**任意オプション:**

- `-e, --event <name>` - 大会名（画像上部に表示）
- `-o, --output <dir>` - 出力ディレクトリ（デフォルト: `./output`）
- `-l, --layout <type>` - レイアウト: `horizontal`（横）または `vertical`（縦）
- `-b, --background <path>` - 背景画像のパス
- `--width <px>` - 画像の幅（デフォルト: 1920）
- `--height <px>` - 画像の高さ（デフォルト: 1080）

#### `list` - キャラクター一覧表示

利用可能な全キャラクター（32体）の一覧を表示します。

```powershell
bun run dev list
```

#### その他

```powershell
# ヘルプ表示
bun run dev --help

# バージョン表示
bun run dev --version
```

### オプション詳細

#### メンバー指定フォーマット（`-m, --members`）

```
"プレイヤー1:キャラクター1,プレイヤー2:キャラクター2,プレイヤー3:キャラクター3"
```

**キャラクター指定方法:**

1. **キャラクターID**: `sol`, `ky`, `may` など
2. **日本語名**: `ソル`, `カイ`, `メイ` など
3. **エイリアス**: `so`, `ki`, `メー` など

**例:**

```powershell
# 英語ID
-m "P1:sol,P2:ky,P3:may"

# 日本語名
-m "P1:ソル,P2:カイ,P3:メイ"

# エイリアス
-m "P1:so,P2:ki,P3:メー"

# 混在OK
-m "Player1:sol,選手2:カイ,P3:may"
```

#### レイアウト（`-l, --layout`）

- `horizontal`（デフォルト）: 3キャラクターを横一列に配置
- `vertical`: 3キャラクターを縦一列に配置

#### 大会名表示（`-e, --event`）

画像上部に大会名を表示します。

```powershell
-e "GGST 3on3 春季大会 2025"
```

### 使用例

#### 例1: 基本的なチーム画像生成

```powershell
bun run dev generate -t "チームA" -m "P1:sol,P2:ky,P3:may"
```

#### 例2: 日本語キャラクター名を使用

```powershell
bun run dev generate -t "日本代表チーム" -m "P1:ソル,P2:カイ,P3:メイ"
```

#### 例3: 縦レイアウト + 大会名

```powershell
bun run dev generate -t "Team Alpha" -m "P1:axl,P2:ram,P3:gio" -l vertical -e "GGST 3on3 Tournament 2025"
```

#### 例4: カスタムサイズ + 背景画像

```powershell
bun run dev generate -t "チームB" -m "P1:pot,P2:faust,P3:chipp" --width 1280 --height 720 -b "assets/backgrounds/fire.jpg"
```

#### 例5: カスタム出力ディレクトリ

```powershell
bun run dev generate -t "TeamC" -m "P1:goldlewis,P2:testament,P3:bridget" -o "images/teams"
```

#### 例6: 重複キャラクター（同キャラ複数人OK）

```powershell
bun run dev generate -t "ソル軍団" -m "P1:sol,P2:sol,P3:sol"
```

## 対応キャラクター

全32体のGGSTキャラクターに対応しています。

### キャラクター一覧の確認

```powershell
bun run dev list
```

### 主要キャラクター（一部）

| ID | 名前 | 日本語名 | エイリアス |
|---|---|---|---|
| sol | Sol Badguy | ソル＝バッドガイ | so, sol, ソル |
| ky | Ky Kiske | カイ＝キスク | ki, ky, カイ |
| may | May | メイ | may, メイ, メー |
| axl | Axl Low | アクセル＝ロウ | axl, アクセル |
| chipp | Chipp Zanuff | チップ＝ザナフ | chipp, chip, チップ |
| pot | Potemkin | ポチョムキン | pot, potemkin, ポチョ |
| faust | Faust | ファウスト | faust, ファウスト |
| millia | Millia Rage | ミリア＝レイジ | millia, mil, ミリア |
| zato | Zato-1 | ザトー＝ONE | zato, ザトー |
| ram | Ramlethal Valentine | ラムレザル＝ヴァレンタイン | ram, ramlethal, ラム |
| leo | Leo Whitefang | レオ＝ホワイトファング | leo, レオ |
| nago | Nagoriyuki | 名残雪 | nago, nagoriyuki, 名残 |
| gio | Giovanna | ジョヴァーナ | gio, giovanna, ジョヴァ |
| anji | Anji Mito | 御津闇慈 | anji, 闇慈 |
| ino | I-No | イノ | ino, i-no, イノ |

詳細は[docs/CHARACTERS.md](docs/CHARACTERS.md)を参照してください。

## プロジェクト構造

```
ggst-team-image-generator/
├── packages/
│   ├── core/                    # コアライブラリ（CLI/Web共通）
│   │   ├── src/
│   │   │   ├── types/           # TypeScript型定義
│   │   │   ├── registry/        # CharacterRegistry（32キャラ管理）
│   │   │   ├── renderer/        # ImageRenderer（Canvas API）
│   │   │   └── team/            # TeamBuilder（ビルダーパターン）
│   │   └── package.json
│   │
│   ├── cli/                     # CLIアプリケーション
│   │   ├── src/
│   │   │   ├── commands/        # generate、listコマンド
│   │   │   ├── parser.ts        # Bun.argv パーサー
│   │   │   └── index.ts         # エントリーポイント
│   │   └── package.json
│   │
│   └── web/                     # Webアプリケーション（Phase 3予定）
│
├── assets/
│   ├── icons/                   # キャラクター画像（32体）
│   ├── backgrounds/             # 背景画像
│   └── fonts/                   # フォントファイル
│
├── tests/
│   ├── core/                    # ユニットテスト
│   │   ├── TeamBuilder.test.ts
│   │   ├── CharacterRegistry.test.ts
│   │   └── ImageRenderer.test.ts
│   └── cli/                     # CLIテスト
│       ├── parser.test.ts
│       ├── generate.test.ts
│       ├── list.test.ts
│       └── integration.test.ts
│
├── docs/                        # 詳細ドキュメント
│   ├── ARCHITECTURE.md          # システムアーキテクチャ
│   ├── REQUIREMENTS.md          # 機能要件・非機能要件
│   ├── CLI.md                   # CLI設計
│   ├── CHARACTERS.md            # キャラクター一覧
│   ├── DESIGN.md                # プロジェクト設計
│   ├── DATA_STRUCTURES.md       # データ構造
│   ├── TESTING.md               # テスト計画
│   ├── ERROR_HANDLING.md        # エラーハンドリング
│   └── UI_DESIGN.md             # UI設計
│
├── output/                      # 生成画像の出力先（デフォルト）
├── package.json                 # ルートpackage.json（workspaces）
├── tsconfig.json
├── biome.json
├── bunfig.toml
├── CLAUDE.md                    # Claude Code向けガイドライン
└── README.md
```

## 開発

### 環境構築

```powershell
# 依存関係インストール
bun install

# 型チェック
bun run typecheck
```

### 開発コマンド

```powershell
# 開発モード実行
bun run dev

# ビルド
bun run build

# リント
bun run lint        # チェックのみ
bun run lint:fix    # 自動修正

# フォーマット
bun run format

# 型チェック
bun run typecheck
```

### テスト

プロジェクトには100以上のテストケースがあります。

```powershell
# 全テスト実行
bun test

# Watchモード
bun test --watch

# カバレッジ付き
bun test --coverage

# 特定のテストファイルのみ
bun test tests/core/TeamBuilder.test.ts
```

#### テスト構成

- **ユニットテスト** (tests/core/):
  - [TeamBuilder.test.ts](tests/core/TeamBuilder.test.ts) - 68テスト
  - [CharacterRegistry.test.ts](tests/core/CharacterRegistry.test.ts) - 34テスト
  - [ImageRenderer.test.ts](tests/core/ImageRenderer.test.ts) - 56テスト

- **CLIテスト** (tests/cli/):
  - [parser.test.ts](tests/cli/parser.test.ts) - 61テスト
  - [generate.test.ts](tests/cli/generate.test.ts) - 15テスト
  - [list.test.ts](tests/cli/list.test.ts) - 8テスト
  - [integration.test.ts](tests/cli/integration.test.ts) - 35+テスト

## カスタマイズ

### 画像デザインのカスタマイズ

#### デフォルト設定

```typescript
{
  layout: "horizontal",      // レイアウト
  width: 1920,               // 幅（px）
  height: 1080,              // 高さ（px）
  backgroundColor: "#1a1a2e", // 背景色
  fontFamily: "Noto Sans JP", // フォント
  fontSize: 48,              // フォントサイズ（px）
  fontColor: "#ffffff"       // フォント色
}
```

#### カスタム背景画像

```powershell
# assets/backgrounds/ に画像を配置
bun run dev generate -t "チーム" -m "P1:sol,P2:ky,P3:may" -b "assets/backgrounds/custom.jpg"
```

#### カスタムフォント

`assets/fonts/` にフォントファイルを配置し、コード内で `fontFamily` を指定してください（現在はコマンドラインオプション未実装）。

### キャラクター画像の追加

新しいキャラクターを追加する場合:

1. `assets/icons/` に画像を追加（例: `33_chibi_newchar.png`）
2. [packages/core/src/registry/characters.json](packages/core/src/registry/characters.json) にエントリを追加

```json
{
  "id": "newchar",
  "name": "New Character",
  "nameJa": "新キャラ",
  "aliases": ["new", "nc", "新キャラ"],
  "iconPath": "assets/icons/33_chibi_newchar.png"
}
```

## ドキュメント

詳細なドキュメントは [docs/](docs/) ディレクトリにあります。

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - システムアーキテクチャ、技術選定理由
- [REQUIREMENTS.md](docs/REQUIREMENTS.md) - 機能要件・非機能要件
- [CLI.md](docs/CLI.md) - CLIコマンド設計
- [CHARACTERS.md](docs/CHARACTERS.md) - 全32キャラクター一覧とエイリアス
- [DESIGN.md](docs/DESIGN.md) - プロジェクト設計、開発フェーズ
- [DATA_STRUCTURES.md](docs/DATA_STRUCTURES.md) - TypeScript型定義
- [TESTING.md](docs/TESTING.md) - テスト計画
- [ERROR_HANDLING.md](docs/ERROR_HANDLING.md) - エラー種別とメッセージ
- [UI_DESIGN.md](docs/UI_DESIGN.md) - 画像デザイン仕様
- [CLAUDE.md](CLAUDE.md) - Claude Code向けガイドライン

## 技術スタック

- **ランタイム**: Bun v1.1+
- **言語**: TypeScript 5.6+（strict mode）
- **画像処理**: @napi-rs/canvas（Rust製、高速）
- **テスト**: Bun test（Jest互換API）
- **リンター/フォーマッター**: Biome
- **モノレポ**: Bun workspaces

## 今後の予定

### Phase 2: 一括生成機能

- JSON/YAML入力による複数チーム一括生成
- テンプレートシステム

### Phase 3: Webアプリケーション

- React + Tailwind CSS + Vite
- ブラウザ上でのリアルタイムプレビュー
- ドラッグ&ドロップによるキャラクター選択

### Phase 4: 高度な機能

- 対戦カード画像生成（2チーム対比）
- Discord Bot統合
- start.gg API連携（大会データ自動取得）

## ライセンス

このプロジェクトは個人・非商用利用を想定しています。

## 貢献

バグ報告や機能リクエストは、GitHubのIssuesにてお願いします。

---

Made with ❤️ for the GGST community
