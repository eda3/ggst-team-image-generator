import { characterRegistry } from "../registry/CharacterRegistry";
import type { Team, TeamMember } from "../types/team";

export class TeamBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamBuilderError";
  }
}

export class TeamBuilder {
  private teamName = "";
  private members: TeamMember[] = [];

  setTeamName(name: string): this {
    if (!name || name.trim() === "") {
      throw new TeamBuilderError("チーム名は必須です");
    }
    this.teamName = name.trim();
    return this;
  }

  addMember(playerName: string, characterIdOrAlias: string): this {
    if (this.members.length >= 3) {
      throw new TeamBuilderError("チームメンバーは3人までです");
    }

    if (!playerName || playerName.trim() === "") {
      throw new TeamBuilderError("プレイヤー名は必須です");
    }

    const characterId = characterRegistry.resolveCharacterId(characterIdOrAlias);
    if (!characterId) {
      throw new TeamBuilderError(`キャラクター "${characterIdOrAlias}" が見つかりません`);
    }

    this.members.push({
      playerName: playerName.trim(),
      characterId,
    });

    return this;
  }

  parseMembersString(membersStr: string): this {
    const memberParts = membersStr.split(",");

    for (const part of memberParts) {
      const trimmed = part.trim();
      const match = trimmed.match(/^(.+?):(.+)$/);

      if (!match) {
        throw new TeamBuilderError(
          `メンバー形式が不正です: "${trimmed}"。"プレイヤー名:キャラクター" の形式で指定してください`
        );
      }

      const [, playerName, characterIdOrAlias] = match;
      this.addMember(playerName.trim(), characterIdOrAlias.trim());
    }

    return this;
  }

  build(): Team {
    if (!this.teamName) {
      throw new TeamBuilderError("チーム名が設定されていません");
    }

    if (this.members.length !== 3) {
      throw new TeamBuilderError(`チームメンバーは3人必要です（現在: ${this.members.length}人）`);
    }

    const team: Team = {
      name: this.teamName,
      members: this.members as [TeamMember, TeamMember, TeamMember],
    };

    this.reset();
    return team;
  }

  reset(): this {
    this.teamName = "";
    this.members = [];
    return this;
  }
}
