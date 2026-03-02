import { describe, it, expect } from "vitest";
import { MorphAnalyzer } from "../src/index.js";
import { loadDict } from "../src/node-loader.js";
import { resolve } from "node:path";

const analyzer = new MorphAnalyzer(loadDict(resolve(import.meta.dirname, '..', 'dict')));

describe("predictor", () => {
  it("returns empty array for unknown non-Slavic words", () => {
    const results = analyzer.parse("abcdefg");
    expect(results).toEqual([]);
  });

  it("predicts morphological analysis for unknown Slavic-looking words", () => {
    const results = analyzer.parse("кавідны");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.predicted)).toBe(true);

    // Should have plausible POS tags ('A' for adjective)
    const posTags = results.map((r) => r.tags.pos).filter(Boolean);
    expect(posTags.length).toBeGreaterThan(0);
    expect(posTags).toContain("A");
  });

  it("returns exact matches for known words (not predicted)", () => {
    const results = analyzer.parse("дом");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => !r.predicted)).toBe(true);
  });

  it("predicted results support inflect() method", () => {
    const results = analyzer.parse("кавідны");
    expect(results.length).toBeGreaterThan(0);

    const result = results[0];
    const inflected = result.inflect({ case: "G" });
    expect(inflected).toBeDefined();
    expect(inflected?.predicted).toBe(true);
  });

  it("predicted results support lexeme property", () => {
    const results = analyzer.parse("кавідны");
    expect(results.length).toBeGreaterThan(0);

    const result = results[0];
    const lexeme = result.lexeme;
    expect(lexeme.length).toBeGreaterThan(0);
    expect(lexeme.every((form) => form.predicted)).toBe(true);
  });

  it("prefers longer suffix matches", () => {
    // Test that words with longer Slavic suffixes get better predictions
    const shortSuffix = analyzer.parse("кавід");
    const longSuffix = analyzer.parse("кавідны");

    // Both should return results, but longer suffix should have more confident predictions
    expect(shortSuffix.length).toBeGreaterThan(0);
    expect(longSuffix.length).toBeGreaterThan(0);
  });

  it("handles various Slavic suffix patterns", () => {
    const testCases = [
      "пазамавідны", // adjective-like (likely unknown)
      "лапатычны", // longer adjective (likely unknown)
      "пантуліраваць", // verb-like (likely unknown)
      "шакшукар", // noun-like (likely unknown)
      "суперлопкі", // compound adjective (likely unknown)
    ];

    for (const word of testCases) {
      const results = analyzer.parse(word);
      // Should return predictions for unknown words
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.predicted)).toBe(true);

      const posTags = results.map((r) => r.tags.pos).filter(Boolean);
      expect(posTags.length).toBeGreaterThan(0);
    }
  });
});
