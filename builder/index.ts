import { extractWords } from './extract.js';
import { analyzeWords } from './analyze.js';
import { buildTrie } from './compress.js';
import { buildPredictTrie } from './predict.js';
import { exportDict } from './export.js';

export async function buildDictionary(grammarDbPath: string, outDir: string): Promise<void> {
  console.log('Step 1: Extracting words from GrammarDB XML...');
  const rawWords = await extractWords(grammarDbPath);
  console.log(`  Extracted ${rawWords.length} words`);

  console.log('\nStep 2: Analyzing stems and paradigms...');
  const analysis = analyzeWords(rawWords);

  console.log('\nStep 3: Building packed trie + DAFSA minimization...');
  const dawgBuffer = buildTrie(analysis);

  console.log('\nStep 4: Building predict trie...');
  const predictBuffer = buildPredictTrie(analysis);

  console.log('\nStep 5: Exporting dictionary files...');
  exportDict(outDir, analysis, dawgBuffer, predictBuffer);

  console.log('\nDone!');
}
