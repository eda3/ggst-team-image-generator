import type { Character, CharacterId } from "../types/character";
import charactersData from "./characters.json";

export class CharacterRegistry {
  private characters: Map<CharacterId, Character>;
  private aliasMap: Map<string, CharacterId>;

  constructor() {
    this.characters = new Map();
    this.aliasMap = new Map();
    this.loadCharacters();
  }

  private loadCharacters(): void {
    for (const char of charactersData.characters) {
      this.characters.set(char.id, char);
      this.aliasMap.set(char.id.toLowerCase(), char.id);
      this.aliasMap.set(char.name.toLowerCase(), char.id);
      this.aliasMap.set(char.nameJa, char.id);
      for (const alias of char.aliases) {
        this.aliasMap.set(alias.toLowerCase(), char.id);
      }
    }
  }

  getCharacter(idOrAlias: string): Character | undefined {
    const normalizedInput = idOrAlias.toLowerCase().trim();
    const id = this.aliasMap.get(normalizedInput);
    if (id) {
      return this.characters.get(id);
    }
    return undefined;
  }

  getCharacterById(id: CharacterId): Character | undefined {
    return this.characters.get(id);
  }

  resolveCharacterId(idOrAlias: string): CharacterId | undefined {
    const normalizedInput = idOrAlias.toLowerCase().trim();
    return this.aliasMap.get(normalizedInput);
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  getAllCharacterIds(): CharacterId[] {
    return Array.from(this.characters.keys());
  }

  hasCharacter(idOrAlias: string): boolean {
    const normalizedInput = idOrAlias.toLowerCase().trim();
    return this.aliasMap.has(normalizedInput);
  }
}

export const characterRegistry = new CharacterRegistry();
