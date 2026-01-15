# システム構成

## 1. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
├────────────────────────┬────────────────────────────────────┤
│     CLI Interface      │         Web Interface              │
│   (Bun.argv + 自前)    │     (React + Vite)                 │
└────────────────────────┴────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Library                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ TeamBuilder │  │ ImageRender │  │  TemplateEngine     │  │
│  │             │  │             │  │                     │  │
│  │ - validate  │  │ - compose   │  │  - load template    │  │
│  │ - build     │  │ - render    │  │  - apply style      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Character Registry                      ││
│  │  - キャラクター情報管理                                   ││
│  │  - 画像パス解決                                          ││
│  │  - エイリアス解決                                        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ Character Data  │  │     Asset Files                 │   │
│  │  (JSON)         │  │  (キャラクター画像/フォント等)    │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 2. 技術スタック

| カテゴリ | CLI版 | Web版 |
|---------|-------|-------|
| 言語 | TypeScript | TypeScript |
| ランタイム | **Bun (v1.1+)** | Browser |
| 画像処理 | **@napi-rs/canvas** | Canvas API |
| CLI | **Bun.argv + 自前パーサー** | - |
| UI | - | React + Tailwind CSS |
| ビルド | **Bun (built-in bundler)** | Vite |
| テスト | **bun test** | bun test |
| パッケージ管理 | **bun** | bun |

## 3. Bunを選定した理由

| 特徴 | メリット |
|------|---------|
| 高速な起動 | CLIツールの体感速度が大幅向上 |
| ネイティブTypeScript | tsconfigのみで即実行、ビルド不要 |
| 組み込みバンドラー | 追加ツール不要でビルド可能 |
| 組み込みテストランナー | Vitest不要、`bun test`で完結 |
| Node.js互換 | 既存npmパッケージの多くが動作 |
| Workspace対応 | モノレポ構成をネイティブサポート |

## 4. 画像処理ライブラリの選定

| ライブラリ | メリット | デメリット | 採用 |
|-----------|---------|-----------|------|
| **@napi-rs/canvas** | Bun対応、Canvas API互換、Rust製で高速 | やや新しい | ✅ CLI |
| node-canvas | 実績あり | Bun互換性に課題あり | ❌ |
| sharp | 高速、軽量 | Canvas API非互換 | △ 補助 |
| Canvas API | ブラウザ標準 | サーバー非対応 | ✅ Web |

**方針**: `@napi-rs/canvas` でCLI版を実装し、コアロジックをCanvas API準拠で書くことでWeb版への移行を容易にする。

## 5. CLIフレームワークの選定

| ライブラリ | 特徴 | 採用 |
|-----------|------|------|
| **Bun.argv（生）** | 依存なし、シンプル | ✅ 基本 |
| **@cliffy/command** | Deno発、Bun対応、型安全 | ✅ 拡張時 |
| Commander.js | Node.js定番 | △ 互換あり |
| yargs | 高機能 | △ 互換あり |

**方針**: 最初は `Bun.argv` + 自前パーサーでシンプルに実装。複雑化したら `@cliffy/command` を導入。

---

## 6. ディレクトリ構成

```
ggst-team-image-generator/
├── docs/
│   ├── DESIGN.md              # 設計書概要
│   ├── REQUIREMENTS.md        # 要件定義
│   ├── ARCHITECTURE.md        # 本ドキュメント
│   ├── DATA_STRUCTURES.md     # データ構造
│   ├── CLI.md                 # CLI設計
│   ├── UI_DESIGN.md           # 画像デザイン仕様
│   ├── CHARACTERS.md          # キャラクターリスト
│   ├── ERROR_HANDLING.md      # エラーハンドリング
│   └── TESTING.md             # テスト計画
│
├── packages/
│   ├── core/                  # コアライブラリ（CLI/Web共通）
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types/
│   │   │   │   ├── character.ts
│   │   │   │   ├── team.ts
│   │   │   │   └── render.ts
│   │   │   ├── registry/
│   │   │   │   ├── CharacterRegistry.ts
│   │   │   │   └── characters.json
│   │   │   ├── renderer/
│   │   │   │   ├── ImageRenderer.ts
│   │   │   │   ├── layouts/
│   │   │   │   │   ├── HorizontalLayout.ts
│   │   │   │   │   ├── VerticalLayout.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── templates/
│   │   │   │       ├── DefaultTemplate.ts
│   │   │   │       └── index.ts
│   │   │   ├── builder/
│   │   │   │   └── TeamBuilder.ts
│   │   │   └── utils/
│   │   │       ├── color.ts
│   │   │       └── validation.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli/                   # CLIアプリケーション
│   │   ├── src/
│   │   │   ├── index.ts       # エントリーポイント
│   │   │   ├── commands/
│   │   │   │   ├── generate.ts
│   │   │   │   ├── batch.ts
│   │   │   │   └── list-characters.ts
│   │   │   ├── parser.ts      # Bun.argv パーサー
│   │   │   └── utils/
│   │   │       └── file.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                   # Webアプリケーション（Phase 3）
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── TeamForm.tsx
│       │   │   ├── CharacterSelector.tsx
│       │   │   ├── Preview.tsx
│       │   │   └── DownloadButton.tsx
│       │   ├── hooks/
│       │   │   └── useImageGenerator.ts
│       │   └── styles/
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── assets/
│   ├── characters/            # キャラクター画像
│   │   ├── icons/            # 64x64
│   │   └── portraits/        # 256x256
│   ├── fonts/                # フォントファイル
│   │   └── NotoSansJP-Bold.ttf
│   ├── backgrounds/          # 背景画像
│   └── templates/            # テンプレート用素材
│
├── output/                   # 生成画像出力先（gitignore）
│
├── examples/                 # サンプル入力ファイル
│   ├── single-team.json
│   └── tournament.yaml
│
├── tests/                    # bun test 用テストファイル
│   ├── core/
│   │   ├── CharacterRegistry.test.ts
│   │   ├── TeamBuilder.test.ts
│   │   └── ImageRenderer.test.ts
│   ├── cli/
│   │   └── generate.test.ts
│   └── fixtures/
│
├── package.json              # ルートpackage.json（workspaces）
├── bunfig.toml               # Bun設定ファイル
├── tsconfig.json             # ルートtsconfig
├── .gitignore
└── README.md
```

---

## 7. Bun固有の設定ファイル

### 7.1 bunfig.toml

```toml
# bunfig.toml - Bun設定ファイル

[install]
# 依存関係のインストール設定
peer = false
optional = true

[install.lockfile]
# lockfileの設定
save = true

[test]
# テスト設定
coverage = true
coverageDir = "coverage"

[run]
# 実行時設定
bun = true
```

### 7.2 ルート package.json

```json
{
  "name": "ggst-team-image-generator",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "bun run packages/cli/src/index.ts",
    "build": "bun build packages/cli/src/index.ts --outdir dist --target bun",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "lint": "bunx biome check .",
    "lint:fix": "bunx biome check --write .",
    "format": "bunx biome format --write .",
    "typecheck": "bunx tsc --noEmit"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/bun": "^1.1.0",
    "typescript": "^5.6.0"
  }
}
```

### 7.3 packages/cli/package.json

```json
{
  "name": "@ggst-team/cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "ggst-team": "./src/index.ts"
  },
  "scripts": {
    "start": "bun run src/index.ts",
    "dev": "bun --watch run src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun --minify",
    "build:standalone": "bun build src/index.ts --compile --outfile dist/ggst-team"
  },
  "dependencies": {
    "@ggst-team/core": "workspace:*",
    "@napi-rs/canvas": "^0.1.56",
    "yaml": "^2.6.0"
  }
}
```

### 7.4 packages/core/package.json

```json
{
  "name": "@ggst-team/core",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./registry": "./src/registry/index.ts",
    "./renderer": "./src/renderer/index.ts"
  },
  "dependencies": {
    "@napi-rs/canvas": "^0.1.56"
  }
}
```

---

## 付録: Bun vs Node.js 比較

| 項目 | Bun | Node.js |
|------|-----|---------|
| 起動速度 | ⚡ 非常に高速 | 普通 |
| TypeScript | ネイティブ対応 | 要トランスパイル |
| パッケージマネージャー | 組み込み（高速） | npm/yarn/pnpm |
| テストランナー | 組み込み | Jest/Vitest等 |
| バンドラー | 組み込み | webpack/esbuild等 |
| npm互換性 | ほぼ完全 | - |
| スタンドアロンビルド | `--compile`で可能 | pkg等が必要 |

**本プロジェクトでBunを採用する理由:**
1. CLIツールの起動速度が重要
2. TypeScriptをそのまま実行できる
3. テスト・ビルドが追加ツールなしで完結
4. スタンドアロンバイナリで配布が容易
