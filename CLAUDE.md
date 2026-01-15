# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GGST 3on3チーム画像生成ツール - Guilty Gear Striveの3on3形式大会向けに、チームのキャラクター構成とチーム名を視覚的に表現した画像を自動生成するCLI/Webツール。

## Tech Stack

- **Runtime**: Bun v1.1+
- **Language**: TypeScript
- **Image Processing**: @napi-rs/canvas (CLI), Canvas API (Web)
- **CLI Parser**: Bun.argv + 自前パーサー
- **Web UI**: React + Tailwind CSS + Vite (Phase 3)
- **Test**: bun test
- **Linter/Formatter**: Biome

## Common Commands

```bash
# Development
bun run dev                    # Run CLI in development mode
bun run packages/cli/src/index.ts generate -t "チーム名" -m "P1:sol,P2:ky,P3:may"

# Build
bun build packages/cli/src/index.ts --outdir dist --target bun
bun build packages/cli/src/index.ts --compile --outfile dist/ggst-team  # Standalone binary

# Test
bun test                       # Run all tests
bun test --watch              # Watch mode
bun test --coverage           # With coverage

# Lint & Format
bunx biome check .            # Check lint
bunx biome check --write .    # Auto-fix
bunx biome format --write .   # Format

# Type check
bunx tsc --noEmit
```

## Architecture

モノレポ構成（Bun workspaces）:
- `packages/core/` - CLI/Web共通のコアライブラリ（TeamBuilder, ImageRenderer, CharacterRegistry）
- `packages/cli/` - CLIアプリケーション
- `packages/web/` - Webアプリケーション（Phase 3）
- `assets/` - キャラクター画像、フォント、背景画像
- `tests/` - テストファイル

## Key Design Decisions

- Canvas API準拠でコアロジックを実装し、CLI→Web移行を容易にする
- キャラクターIDとエイリアスの両方でキャラクター検索可能
- チームは必ず3人構成（重複キャラクター許可）
