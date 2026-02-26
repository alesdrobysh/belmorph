import Database from 'better-sqlite3';

export interface RawWord {
  variantId: number;
  lemma: string;
  paradigmTag: string;
  forms: Array<{ formTag: string; text: string }>;
}

/**
 * Extract all words with their forms from the GrammarDB SQLite database.
 */
export function extractWords(dbPath: string): RawWord[] {
  const db = new Database(dbPath, { readonly: true });

  // Get all variants with their paradigm info
  const variants = db.prepare(`
    SELECT v.id as variant_id, v.lemma_clean as lemma, p.tag as paradigm_tag
    FROM variants v
    JOIN paradigms p ON v.pdg_id = p.pdg_id
    ORDER BY v.id
  `).all() as Array<{ variant_id: number; lemma: string; paradigm_tag: string }>;

  // Get all forms grouped by variant_id
  const formsStmt = db.prepare(`
    SELECT form_tag, form_text_clean
    FROM forms
    WHERE variant_id = ?
    ORDER BY form_tag
  `);

  const words: RawWord[] = [];

  for (const v of variants) {
    const forms = formsStmt.all(v.variant_id) as Array<{
      form_tag: string;
      form_text_clean: string;
    }>;

    if (forms.length === 0) continue;

    words.push({
      variantId: v.variant_id,
      lemma: v.lemma.toLowerCase(),
      paradigmTag: v.paradigm_tag,
      forms: forms.map(f => ({
        formTag: f.form_tag,
        text: f.form_text_clean.toLowerCase(),
      })),
    });
  }

  db.close();
  return words;
}
