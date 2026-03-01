import { resolve } from "node:path";
import { buildDictionary } from "../builder/index.js";

const projectRoot = resolve(import.meta.dirname, "..");
const grammarDbPath = resolve(projectRoot, "GrammarDB", "data");
const outDir = resolve(projectRoot, "dict");

console.log("Building belmorph dictionary...");
console.log(`  GrammarDB: ${grammarDbPath}`);
console.log(`  Output: ${outDir}`);
console.log("");

try {
  await buildDictionary(grammarDbPath, outDir);
} catch (error) {
  console.error('\nError:', (error as Error).message);
  process.exit(1);
}
