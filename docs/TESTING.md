# テスト計画

## 1. Bun Test 概要

```typescript
// Bun組み込みのテストランナーを使用
// Jest互換のAPIを提供

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
```

## 2. ユニットテスト

### CharacterRegistry

```typescript
// tests/core/CharacterRegistry.test.ts
import { describe, it, expect } from 'bun:test';
import { CharacterRegistry } from '@ggst-team/core/registry';

describe('CharacterRegistry', () => {
  const registry = new CharacterRegistry();

  it('IDでキャラクターを取得できる', () => {
    const char = registry.getById('sol');
    expect(char).toBeDefined();
    expect(char?.name).toBe('Sol Badguy');
  });

  it('エイリアスでキャラクターを検索できる', () => {
    const char = registry.findByAlias('ソル');
    expect(char?.id).toBe('sol');
  });

  it('存在しないキャラクターでnullを返す', () => {
    const char = registry.getById('invalid');
    expect(char).toBeNull();
  });
});
```

### TeamBuilder

```typescript
// tests/core/TeamBuilder.test.ts
import { describe, it, expect } from 'bun:test';
import { TeamBuilder } from '@ggst-team/core/builder';

describe('TeamBuilder', () => {
  it('有効なチームを構築できる', () => {
    const team = new TeamBuilder()
      .setName('チームA')
      .addMember('Player1', 'sol')
      .addMember('Player2', 'ky')
      .addMember('Player3', 'may')
      .build();

    expect(team.name).toBe('チームA');
    expect(team.members).toHaveLength(3);
  });

  it('3人未満でバリデーションエラー', () => {
    expect(() => {
      new TeamBuilder()
        .setName('Invalid')
        .addMember('Player1', 'sol')
        .build();
    }).toThrow('チームは3人である必要があります');
  });

  it('重複キャラクターを許可する', () => {
    const team = new TeamBuilder()
      .setName('ソル3人')
      .addMember('P1', 'sol')
      .addMember('P2', 'sol')
      .addMember('P3', 'sol')
      .build();

    expect(team.members.every(m => m.characterId === 'sol')).toBe(true);
  });
});
```

### ImageRenderer

```typescript
// tests/core/ImageRenderer.test.ts
import { describe, it, expect } from 'bun:test';
import { ImageRenderer } from '@ggst-team/core/renderer';

describe('ImageRenderer', () => {
  it('horizontalレイアウトで画像を生成できる', async () => {
    const renderer = new ImageRenderer();
    const buffer = await renderer.render({
      team: mockTeam,
      layout: 'horizontal',
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('指定サイズで出力できる', async () => {
    const renderer = new ImageRenderer();
    const buffer = await renderer.render({
      team: mockTeam,
      size: { width: 1200, height: 675 },
    });

    // PNG header check
    expect(buffer.slice(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  });
});
```

## 3. E2Eテスト

```typescript
// tests/cli/generate.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { $ } from 'bun';
import { existsSync, unlinkSync } from 'fs';

describe('CLI generate command', () => {
  const outputPath = './output/test-team.png';

  afterAll(() => {
    if (existsSync(outputPath)) {
      unlinkSync(outputPath);
    }
  });

  it('基本的な画像生成が成功する', async () => {
    const result = await $`bun run packages/cli/src/index.ts generate \
      -t "テストチーム" \
      -m "P1:sol,P2:ky,P3:may" \
      -o ${outputPath}`.quiet();

    expect(result.exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);
  });

  it('存在しないキャラクターでエラー終了する', async () => {
    const result = await $`bun run packages/cli/src/index.ts generate \
      -t "エラーチーム" \
      -m "P1:invalid,P2:ky,P3:may"`.quiet().nothrow();

    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain('キャラクター');
  });
});
```

## 4. テスト実行コマンド

```bash
# 全テスト実行
bun test

# 特定ファイルのみ
bun test tests/core/CharacterRegistry.test.ts

# watchモード
bun test --watch

# カバレッジ付き
bun test --coverage
```
