# データ構造

## 1. キャラクターデータ

```typescript
// types/character.ts

/** キャラクターID（一意識別子） */
type CharacterId = string;

/** キャラクター情報 */
interface Character {
  /** 一意識別子（例: "sol", "ky", "may"） */
  id: CharacterId;

  /** 正式名称 */
  name: string;

  /** 日本語名 */
  nameJa: string;

  /** 略称・エイリアス（入力補完用） */
  aliases: string[];

  /** 画像パス */
  images: {
    /** アイコン（小、64x64程度） */
    icon: string;
    /** ポートレート（中、256x256程度） */
    portrait: string;
    /** フルアート（大、オプショナル） */
    fullArt?: string;
  };

  /** メタ情報 */
  meta: {
    /** 実装日 */
    releaseDate: string;
    /** DLCかどうか */
    isDLC: boolean;
  };
}

/** キャラクターレジストリ */
interface CharacterRegistry {
  version: string;
  lastUpdated: string;
  characters: Character[];
}
```

## 2. チームデータ

```typescript
// types/team.ts

/** チームメンバー */
interface TeamMember {
  /** プレイヤー名 */
  playerName: string;

  /** 使用キャラクターID */
  characterId: CharacterId;

  /** 順番（1st, 2nd, 3rd） */
  order: 1 | 2 | 3;
}

/** チーム情報 */
interface Team {
  /** チーム名 */
  name: string;

  /** チームメンバー（3名） */
  members: [TeamMember, TeamMember, TeamMember];

  /** オプション: チームカラー */
  color?: string;

  /** オプション: チームロゴ画像パス */
  logo?: string;
}
```

## 3. 画像生成設定

```typescript
// types/render.ts

/** レイアウトタイプ */
type LayoutType = 'horizontal' | 'vertical' | 'triangle';

/** 画像サイズプリセット */
type SizePreset = 'twitter' | 'discord' | 'custom';

/** 画像生成オプション */
interface RenderOptions {
  /** 出力サイズ */
  size: {
    width: number;
    height: number;
  };

  /** レイアウト */
  layout: LayoutType;

  /** テンプレートID */
  templateId: string;

  /** 背景設定 */
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };

  /** フォント設定 */
  font: {
    family: string;
    teamNameSize: number;
    playerNameSize: number;
  };

  /** 出力形式 */
  output: {
    format: 'png' | 'jpeg' | 'webp';
    quality?: number;
  };
}

/** プリセット定義 */
const SIZE_PRESETS: Record<SizePreset, { width: number; height: number }> = {
  twitter: { width: 1200, height: 675 },
  discord: { width: 800, height: 450 },
  custom: { width: 1920, height: 1080 },
};
```

## 4. 入力フォーマット（一括生成用）

```yaml
# teams.yaml
tournament:
  name: "GGST 3on3 月例大会"
  date: "2025-01-20"

teams:
  - name: "チームA"
    members:
      - player: "Player1"
        character: "sol"
      - player: "Player2"
        character: "ky"
      - player: "Player3"
        character: "may"

  - name: "チームB"
    members:
      - player: "Player4"
        character: "ram"
      - player: "Player5"
        character: "giovanna"
      - player: "Player6"
        character: "nagoriyuki"
```
