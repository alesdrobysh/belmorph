import { resolve } from "node:path";
import { buildDictionary } from "../builder/index.js";

const projectRoot = resolve(import.meta.dirname, "..");
const dbPath = resolve(projectRoot, "grammardb.sqlite3");
const outDir = resolve(projectRoot, "dict");

console.log("Building belaz dictionary...");
console.log(`  DB: ${dbPath}`);
console.log(`  Output: ${outDir}`);
console.log("");

buildDictionary(dbPath, outDir);
