import type { CharacterId } from "./character";

export interface TeamMember {
  playerName: string;
  characterId: CharacterId;
}

export interface Team {
  name: string;
  members: [TeamMember, TeamMember, TeamMember];
}

export interface TeamInput {
  name: string;
  members: string;
}
