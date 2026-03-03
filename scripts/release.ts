#!/usr/bin/env tsx
/**
 * Release script for belmorph.
 * Usage: npm run release
 *
 * Requires: GEMINI_API_KEY env var
 */

import { GoogleGenAI } from "@google/genai";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── helpers ─────────────────────────────────────────────────────────────────

function run(cmd: string): string {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

function ask(
  rl: ReturnType<typeof createInterface>,
  question: string,
): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function gemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("No GEMINI_API_KEY");
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
  });
  if (!response.text) throw new Error("No text in Gemini response");
  return response.text.trim();
}

function parseJsonFromLlm<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

function bumpVersion(
  version: string,
  type: "major" | "minor" | "patch",
): string {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

// ── changelog helpers ────────────────────────────────────────────────────────

const CHANGELOG_HEADER_EN = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
`;

const CHANGELOG_HEADER_BE = `# Журнал змяненняў

Усе значныя змяненні ў гэтым праекце дакументуюцца ў гэтым файле.

Фармат заснаваны на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
`;

interface ChangelogSections {
  added?: string[];
  changed?: string[];
  fixed?: string[];
  removed?: string[];
}

function formatSection(heading: string, items: string[] | undefined): string {
  if (!items || items.length === 0) return "";
  return `### ${heading}\n${items.map((i) => `- ${i}`).join("\n")}\n`;
}

function buildVersionBlock(
  version: string,
  date: string,
  sections: ChangelogSections,
  lang: "en" | "be",
): string {
  const headings =
    lang === "en"
      ? {
          added: "Added",
          changed: "Changed",
          fixed: "Fixed",
          removed: "Removed",
        }
      : {
          added: "Дадана",
          changed: "Змена",
          fixed: "Выпраўлена",
          removed: "Выдалена",
        };

  const body = [
    formatSection(headings.added, sections.added),
    formatSection(headings.changed, sections.changed),
    formatSection(headings.fixed, sections.fixed),
    formatSection(headings.removed, sections.removed),
  ]
    .filter(Boolean)
    .join("\n");

  return `## [${version}] - ${date}\n\n${body}`;
}

function prependToChangelog(
  filePath: string,
  header: string,
  versionBlock: string,
): void {
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  const withoutHeader = existing.startsWith("#")
    ? existing.replace(/^#[^\n]*\n[\s\S]*?(?=\n## |\Z)/, "").trimStart()
    : existing.trimStart();

  const content =
    `${header}\n${versionBlock}\n\n${withoutHeader}`.trimEnd() + "\n";
  writeFileSync(filePath, content, "utf8");
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    console.error("Get a key at https://aistudio.google.com/ and export it:");
    console.error("  export GEMINI_API_KEY=your_key_here");
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    // 1. Check for uncommitted changes
    const status = run("git status --porcelain");
    if (status) {
      console.warn("\nWarning: you have uncommitted changes:");
      console.warn(status);
      const cont = await ask(rl, "Continue anyway? [y/N] ");
      if (cont.toLowerCase() !== "y") {
        console.log("Aborted.");
        process.exit(0);
      }
    }

    // 2. Read current version
    const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
    const currentVersion: string = pkg.version;
    console.log(`\nCurrent version: ${currentVersion}`);

    // 3. Get commits since last tag
    let lastTag = "";
    try {
      lastTag = run("git describe --tags --abbrev=0");
    } catch {
      // no tags yet
    }

    const logRange = lastTag ? `${lastTag}..HEAD` : "HEAD";
    const commits = run(`git log ${logRange} --oneline`);
    if (!commits) {
      console.log("No new commits since last tag. Nothing to release.");
      process.exit(0);
    }
    console.log(`\nCommits since ${lastTag || "beginning"}:\n${commits}\n`);

    // 4. LLM: suggest version bump
    console.log("Asking Gemini for version bump suggestion...");
    let suggestedBump: "major" | "minor" | "patch" = "patch";
    let justification = "";
    try {
      const bumpPrompt = `You are a semantic versioning expert. Given these git commits for a Belarusian morphological analyzer npm library, suggest a version bump type.

Current version: ${currentVersion}
Commits:
${commits}

Reply with ONLY valid JSON in this exact format (no markdown, no extra text):
{"bump": "patch"|"minor"|"major", "justification": "one sentence"}`;

      const bumpRaw = await gemini(bumpPrompt);
      const bumpResult = parseJsonFromLlm<{
        bump: string;
        justification: string;
      }>(bumpRaw);
      if (["major", "minor", "patch"].includes(bumpResult.bump)) {
        suggestedBump = bumpResult.bump as "major" | "minor" | "patch";
        justification = bumpResult.justification;
      }
    } catch (e) {
      console.warn("Could not get LLM suggestion:", (e as Error).message);
    }

    // 5. User confirms or overrides bump type
    console.log(`Suggested bump: ${suggestedBump.toUpperCase()}`);
    if (justification) console.log(`Reason: ${justification}`);
    const newVersionPreview = bumpVersion(currentVersion, suggestedBump);
    console.log(`New version would be: ${newVersionPreview}`);

    const bumpInput = await ask(
      rl,
      `Enter bump type [major/minor/patch] or press Enter to accept "${suggestedBump}": `,
    );
    const bump = (
      ["major", "minor", "patch"].includes(bumpInput.trim().toLowerCase())
        ? bumpInput.trim().toLowerCase()
        : suggestedBump
    ) as "major" | "minor" | "patch";

    const newVersion = bumpVersion(currentVersion, bump);
    console.log(`\nReleasing version: ${newVersion}`);

    // 6. LLM: generate changelog entries (both languages in one call)
    const today = new Date().toISOString().slice(0, 10);
    let sectionsEn: ChangelogSections = {};
    let sectionsBe: ChangelogSections = {};

    console.log("\nGenerating changelog entries...");
    try {
      const changelogPrompt = `You are a technical writer creating changelog entries for a Belarusian morphological analyzer npm library called "belmorph".

Commits:
${commits}

Generate changelog entries for version ${newVersion} in both English and Belarusian.
Use Keep a Changelog categories: added, changed, fixed, removed (only include non-empty ones).
Each entry should be a concise bullet point describing user-facing changes.
Belarusian text should use Belarusian (not Russian) language and grammar.

Reply with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "en": {
    "added": ["..."],
    "changed": ["..."],
    "fixed": ["..."],
    "removed": ["..."]
  },
  "be": {
    "added": ["..."],
    "changed": ["..."],
    "fixed": ["..."],
    "removed": ["..."]
  }
}

Omit any category array that has no entries.`;

      const clRaw = await gemini(changelogPrompt);
      const clResult = parseJsonFromLlm<{
        en: ChangelogSections;
        be: ChangelogSections;
      }>(clRaw);
      sectionsEn = clResult.en ?? {};
      sectionsBe = clResult.be ?? {};
    } catch (e) {
      console.warn(
        "Could not generate changelogs automatically:",
        (e as Error).message,
      );
      console.log("Falling back to manual entry...");
      const added = await ask(
        rl,
        'Enter "Added" items (comma-separated, or leave blank): ',
      );
      if (added.trim()) {
        const items = added
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        sectionsEn.added = items;
        sectionsBe.added = items; // user can edit the file afterwards
      }
    }

    // 7. Show generated changelog and let user confirm
    const versionBlockEn = buildVersionBlock(
      newVersion,
      today,
      sectionsEn,
      "en",
    );
    const versionBlockBe = buildVersionBlock(
      newVersion,
      today,
      sectionsBe,
      "be",
    );

    console.log("\n── English changelog entry ──────────────────────────────");
    console.log(versionBlockEn);
    console.log("── Belarusian changelog entry ───────────────────────────");
    console.log(versionBlockBe);
    console.log("─────────────────────────────────────────────────────────\n");

    const proceed = await ask(
      rl,
      "Write changelogs, bump version, commit, and tag? [y/N] ",
    );
    if (proceed.toLowerCase() !== "y") {
      console.log("Aborted. No files changed.");
      process.exit(0);
    }

    // 8 & 9. Write changelogs
    const changelogEn = resolve(ROOT, "CHANGELOG.md");
    const changelogBe = resolve(ROOT, "CHANGELOG.be.md");
    prependToChangelog(changelogEn, CHANGELOG_HEADER_EN, versionBlockEn);
    prependToChangelog(changelogBe, CHANGELOG_HEADER_BE, versionBlockBe);
    console.log("Wrote CHANGELOG.md and CHANGELOG.be.md");

    // 10. Bump version in package.json (and package-lock.json if present)
    run(`npm version ${newVersion} --no-git-tag-version`);
    console.log(`Bumped package.json to ${newVersion}`);

    // 11 & 12. Stage and commit
    const filesToStage = ["CHANGELOG.md", "CHANGELOG.be.md", "package.json"];
    if (existsSync(resolve(ROOT, "package-lock.json")))
      filesToStage.push("package-lock.json");
    run(`git add ${filesToStage.join(" ")}`);
    run(`git commit -m "Release v${newVersion}"`);
    console.log(`Created commit: Release v${newVersion}`);

    // 13. Tag
    run(`git tag v${newVersion}`);
    console.log(`Created tag: v${newVersion}`);

    // 14. Next steps
    console.log("\nDone! Next steps:");
    console.log("  git push && git push --tags");
    console.log("  npm publish");
  } finally {
    rl.close();
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
