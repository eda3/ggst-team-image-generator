# エラーハンドリング

## 1. エラー種別

```typescript
// errors/index.ts

/** 基底エラークラス */
class TeamImageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TeamImageError';
  }
}

/** キャラクター関連エラー */
class CharacterNotFoundError extends TeamImageError {
  constructor(characterId: string) {
    super(
      `キャラクター "${characterId}" が見つかりません`,
      'CHARACTER_NOT_FOUND',
      { characterId }
    );
  }
}

/** バリデーションエラー */
class ValidationError extends TeamImageError {
  constructor(message: string, field: string) {
    super(message, 'VALIDATION_ERROR', { field });
  }
}

/** 画像処理エラー */
class RenderError extends TeamImageError {
  constructor(message: string, cause?: Error) {
    super(message, 'RENDER_ERROR', { cause: cause?.message });
  }
}
```

## 2. エラーメッセージ

| コード | メッセージ | 対処法 |
|--------|-----------|--------|
| CHARACTER_NOT_FOUND | キャラクターが見つかりません | `list-characters`で確認 |
| INVALID_TEAM_SIZE | チームは3人である必要があります | メンバー数を確認 |
| IMAGE_LOAD_FAILED | 画像の読み込みに失敗しました | アセットファイルを確認 |
| OUTPUT_WRITE_FAILED | ファイルの書き込みに失敗しました | 出力先パスを確認 |
