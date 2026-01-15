import { characterRegistry } from "@ggst-team/core";

export function listCommand(): void {
  const characters = characterRegistry.getAllCharacters();

  console.log("利用可能なキャラクター一覧:\n");
  console.log("ID\t\t\t名前\t\t\t\tエイリアス");
  console.log("-".repeat(70));

  for (const char of characters) {
    const idPadded = char.id.padEnd(16);
    const namePadded = char.nameJa.padEnd(20);
    const aliases = char.aliases.join(", ");
    console.log(`${idPadded}${namePadded}${aliases}`);
  }

  console.log(`\n合計: ${characters.length} キャラクター`);
}
