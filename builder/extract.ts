import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs/promises';
import { resolve, join } from 'path';

export interface RawWord {
  variantId: number;
  lemma: string;
  paradigmTag: string;
  forms: Array<{ formTag: string; text: string }>;
}

interface XMLForm {
  '@_tag'?: string;
  '#text': string;
}

interface XMLVariant {
  '@_id': string;
  '@_lemma': string;
  '@_pravapis'?: string;
  '@_slouniki'?: string;
  Form?: XMLForm | XMLForm[];
}

interface XMLParadigm {
  '@_pdgId': string;
  '@_lemma': string;
  '@_tag': string;
  '@_regulation'?: string;
  Note?: string;
  Variant?: XMLVariant | XMLVariant[];
}

interface XMLWordlist {
  Wordlist: {
    Paradigm: XMLParadigm[];
  };
}

/**
 * Remove stress markers (+) from a word
 */
function removeStress(word: string): string {
  return word.replace(/\+/g, '');
}

/**
 * Normalize a word - convert to lowercase and remove stress
 */
function normalizeWord(word: string): string {
  return removeStress(word).toLowerCase();
}

/**
 * Process a single XML file and extract all word paradigms
 */
async function parseXMLFile(filePath: string): Promise<RawWord[]> {
  const xmlContent = await fs.readFile(filePath, 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
    parseTagValue: false,
  });

  const result = parser.parse(xmlContent) as XMLWordlist;
  const words: RawWord[] = [];
  let globalVariantCounter = 1;

  // Ensure Paradigm is an array
  const paradigms = Array.isArray(result.Wordlist.Paradigm)
    ? result.Wordlist.Paradigm
    : [result.Wordlist.Paradigm];

  for (const paradigm of paradigms) {
    const paradigmId = paradigm['@_pdgId'];
    const paradigmTag = paradigm['@_tag'];
    const baseLemma = paradigm['@_lemma'];

    // Ensure Variant is an array
    const variants = paradigm.Variant
      ? Array.isArray(paradigm.Variant)
        ? paradigm.Variant
        : [paradigm.Variant]
      : [];

    for (const variant of variants) {
      // Create a unique variant ID from paradigm + variant ID
      const variantId = globalVariantCounter++;
      
      // Use variant lemma if available, otherwise use base lemma
      const lemma = variant['@_lemma'] || baseLemma;
      const normalizedLemma = normalizeWord(lemma);

      // Process forms
      const forms: Array<{ formTag: string; text: string }> = [];

      if (variant.Form) {
        const formArray = Array.isArray(variant.Form)
          ? variant.Form
          : [variant.Form];

        for (const form of formArray) {
          const formText = form['#text'];
          if (formText) {
            const formTag = form['@_tag'] || '';
            const normalizedForm = normalizeWord(formText);
            forms.push({
              formTag,
              text: normalizedForm,
            });
          }
        }
      }

      if (forms.length > 0) {
        words.push({
          variantId,
          lemma: normalizedLemma,
          paradigmTag,
          forms,
        });
      }
    }
  }

  return words;
}

/**
 * Extract all words from GrammarDB XML files
 */
export async function extractWords(grammarDbPath: string): Promise<RawWord[]> {
  console.log(`  Reading GrammarDB files from: ${grammarDbPath}`);

  // Define the XML files to parse (in order of importance)
  const xmlFiles = [
    'N1.xml', 'N2.xml', 'N3.xml', // Nouns
    'V.xml',                      // Verbs
    'A1.xml', 'A2.xml',           // Adjectives
    'P.xml',                      // Participles
    'R.xml',                      // Adverbs
    'NP.xml',                     // Proper nouns
    'C.xml',                      // Conjunctions
    'E.xml',                      // Prepositions/Particles
    'I.xml',                      // Indeclinable
    'M.xml', 'S.xml', 'W.xml', 'Y.xml', 'Z.xml', // Misc
  ];

  const allWords: RawWord[] = [];

  let foundFiles = 0;
  
  for (const file of xmlFiles) {
    const filePath = join(grammarDbPath, file);
    try {
      const words = await parseXMLFile(filePath);
      console.log(`    ${file}: ${words.length} paradigms`);
      allWords.push(...words);
      foundFiles++;
    } catch (error) {
      console.log(`    ${file}: SKIP (${(error as Error).message})`);
      continue;
    }
  }

  // Fallback: if no GrammarDB files found, use test.xml
  if (foundFiles === 0) {
    const testFilePath = join(grammarDbPath, 'test.xml');
    try {
      const testWords = await parseXMLFile(testFilePath);
      console.log(`    test.xml: ${testWords.length} paradigms (fallback)`);
      allWords.push(...testWords);
    } catch (error) {
      console.log(`    test.xml: SKIP (${(error as Error).message})`);
    }
  }

  console.log(`  Total: ${allWords.length} word variants extracted`);
  return allWords;
}