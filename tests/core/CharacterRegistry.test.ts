import { describe, expect, test } from "bun:test";
import { CharacterRegistry, characterRegistry } from "@ggst-team/core";

describe("CharacterRegistry", () => {
  describe("getCharacter", () => {
    test("IDでキャラクターを取得できる", () => {
      const character = characterRegistry.getCharacter("sol");
      expect(character).toBeDefined();
      expect(character?.id).toBe("sol");
      expect(character?.name).toBe("Sol Badguy");
    });

    test("日本語名でキャラクターを取得できる", () => {
      const character = characterRegistry.getCharacter("ソル");
      expect(character).toBeDefined();
      expect(character?.id).toBe("sol");
    });

    test("エイリアスでキャラクターを取得できる", () => {
      const character = characterRegistry.getCharacter("pot");
      expect(character).toBeDefined();
      expect(character?.id).toBe("potemkin");
    });

    test("大文字小文字を区別しない", () => {
      const character = characterRegistry.getCharacter("SOL");
      expect(character).toBeDefined();
      expect(character?.id).toBe("sol");
    });

    test("存在しないキャラクターはundefinedを返す", () => {
      const character = characterRegistry.getCharacter("unknown");
      expect(character).toBeUndefined();
    });

    test("空文字列はundefinedを返す", () => {
      const character = characterRegistry.getCharacter("");
      expect(character).toBeUndefined();
    });

    test("前後の空白を無視する", () => {
      const character = characterRegistry.getCharacter("  sol  ");
      expect(character).toBeDefined();
      expect(character?.id).toBe("sol");
    });
  });

  describe("getCharacterById", () => {
    test("IDでキャラクターを取得できる", () => {
      const character = characterRegistry.getCharacterById("ky");
      expect(character).toBeDefined();
      expect(character?.name).toBe("Ky Kiske");
    });

    test("存在しないIDはundefinedを返す", () => {
      const character = characterRegistry.getCharacterById("unknown");
      expect(character).toBeUndefined();
    });
  });

  describe("resolveCharacterId", () => {
    test("エイリアスからIDを解決できる", () => {
      expect(characterRegistry.resolveCharacterId("nago")).toBe("nagoriyuki");
      expect(characterRegistry.resolveCharacterId("gio")).toBe("giovanna");
      expect(characterRegistry.resolveCharacterId("ram")).toBe("ramlethal");
    });

    test("存在しないエイリアスはundefinedを返す", () => {
      expect(characterRegistry.resolveCharacterId("invalid")).toBeUndefined();
    });
  });

  describe("getAllCharacters", () => {
    test("全キャラクターを取得できる", () => {
      const characters = characterRegistry.getAllCharacters();
      expect(characters.length).toBeGreaterThan(0);
      expect(characters.length).toBe(32);
    });

    test("全キャラクターにidとnameがある", () => {
      const characters = characterRegistry.getAllCharacters();
      for (const char of characters) {
        expect(char.id).toBeDefined();
        expect(char.name).toBeDefined();
        expect(char.nameJa).toBeDefined();
      }
    });
  });

  describe("getAllCharacterIds", () => {
    test("全キャラクターIDを取得できる", () => {
      const ids = characterRegistry.getAllCharacterIds();
      expect(ids.length).toBe(32);
      expect(ids).toContain("sol");
      expect(ids).toContain("ky");
      expect(ids).toContain("may");
    });
  });

  describe("hasCharacter", () => {
    test("存在するキャラクターはtrueを返す", () => {
      expect(characterRegistry.hasCharacter("sol")).toBe(true);
      expect(characterRegistry.hasCharacter("ソル")).toBe(true);
      expect(characterRegistry.hasCharacter("pot")).toBe(true);
    });

    test("存在しないキャラクターはfalseを返す", () => {
      expect(characterRegistry.hasCharacter("unknown")).toBe(false);
      expect(characterRegistry.hasCharacter("")).toBe(false);
    });
  });

  describe("新しいインスタンスの生成", () => {
    test("新しいインスタンスも同じデータを持つ", () => {
      const registry = new CharacterRegistry();
      const character = registry.getCharacter("sol");
      expect(character).toBeDefined();
      expect(character?.id).toBe("sol");
    });
  });
});
