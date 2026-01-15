# GGST 3on3 チーム画像生成ツール 設計書

## 1. プロジェクト概要

### 1.1 目的
Guilty Gear Strive（GGST）の3on3形式大会において、各チームのキャラクター構成とチーム名を視覚的に表現した画像を自動生成するツール。

### 1.2 背景・課題
- 大会運営時、チーム紹介画像の作成に手間がかかる
- 複数チーム分を手作業で作成するのは非効率
- 統一されたフォーマットで見栄えの良い画像を簡単に生成したい

### 1.3 開発フェーズ
| フェーズ | 内容 | 優先度 |
|---------|------|--------|
| Phase 1 | CLIツール（単一チーム画像生成） | 高 |
| Phase 2 | CLIツール（複数チーム一括生成） | 高 |
| Phase 3 | Webツール化（ブラウザで操作） | 中 |
| Phase 4 | 対戦カード画像生成（2チーム対比） | 低 |

---

## 2. ドキュメント構成

詳細は以下のドキュメントを参照してください。

| ドキュメント | 内容 |
|-------------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 機能要件・非機能要件 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | システム構成・技術スタック・ディレクトリ構成 |
| [DATA_STRUCTURES.md](./DATA_STRUCTURES.md) | TypeScript型定義・データ構造 |
| [CLI.md](./CLI.md) | CLIコマンド設計・パーサー実装 |
| [UI_DESIGN.md](./UI_DESIGN.md) | 画像デザイン仕様・色彩・フォント |
| [CHARACTERS.md](./CHARACTERS.md) | GGSTキャラクターリスト |
| [ERROR_HANDLING.md](./ERROR_HANDLING.md) | エラー種別・エラーメッセージ |
| [TESTING.md](./TESTING.md) | テスト計画・テストコード例 |

---

## 3. 将来の拡張案

### 3.1 機能拡張
- [ ] 対戦カード画像生成（2チーム対比表示）
- [ ] トーナメント表画像生成
- [ ] アニメーションGIF/動画生成
- [ ] Discord Bot統合（Bun + Discord.js）
- [ ] start.gg API連携（自動チーム取得）

### 3.2 カスタマイズ拡張
- [ ] ユーザー定義テンプレート
- [ ] カスタムフォント対応
- [ ] チームロゴ配置
- [ ] スポンサーロゴ配置

### 3.3 配信向け機能
- [ ] OBS連携（StreamDeck等）
- [ ] リアルタイム更新対応

### 3.4 Bun固有の拡張
- [ ] Bun.serve() でローカルWebサーバー提供
- [ ] Bun SQLite でチーム情報永続化
- [ ] スタンドアロンバイナリ配布

---

## 4. 開発スケジュール（目安）

| フェーズ | タスク | 見積もり |
|---------|--------|---------|
| Phase 1-1 | プロジェクト初期化、型定義 | 1.5時間 |
| Phase 1-2 | CharacterRegistry実装 | 2時間 |
| Phase 1-3 | ImageRenderer実装 | 4時間 |
| Phase 1-4 | CLIコマンド実装（Bun.argv） | 1.5時間 |
| Phase 1-5 | テスト・デバッグ（bun test） | 2時間 |
| **Phase 1 計** | | **11時間** |
| Phase 2 | 一括生成、テンプレート | 5時間 |
| Phase 3 | Webツール化 | 10時間 |
| Phase 4 | 対戦カード生成 | 4時間 |

※ Bunの高速性により、Node.js比で約10%短縮見込み

---

## 5. 参考資料

### Bun関連
- [Bun公式ドキュメント](https://bun.sh/docs)
- [Bun.argv](https://bun.sh/docs/api/utils#bun-argv)
- [Bun Test](https://bun.sh/docs/cli/test)
- [Bun Build](https://bun.sh/docs/bundler)
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)

### 画像処理
- [@napi-rs/canvas](https://github.com/aspect-ratio/canvas) - Rust製Canvas実装
- [Canvas API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### CLI
- [@cliffy/command](https://cliffy.io/docs/command) - Deno/Bun対応CLIフレームワーク

### GGST
- [GGST公式](https://www.guiltygear.com/ggst/) - キャラクター情報
- [Dustloop Wiki](https://www.dustloop.com/w/GGST) - キャラクター詳細情報

---

*設計書バージョン: 2.0.0*
*最終更新: 2025-01-15*
*ランタイム: Bun v1.1+*
