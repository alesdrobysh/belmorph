<script lang="ts">
  import { Tokenizer, TokenType, TextAnalyzer } from "belmorph";
  import type { Token, TokenType as TT, MorphAnalyzer } from "belmorph";
  import { appState } from "../lib/lang.svelte.js";
  import { UI, POS, POS_EN } from "../lib/i18n.js";

  let { morph = null as MorphAnalyzer | null }: { morph?: MorphAnalyzer | null } = $props();

  const ui = $derived(UI[appState.lang]);

  const COLOR_MAP: Record<string, { bg: string; fg: string; label: string; labelEn: string }> = {
    [TokenType.WORD]:    { bg: 'transparent',       fg: 'var(--fg)',        label: 'Слова',     labelEn: 'Word' },
    [TokenType.NUMBER]:  { bg: '#e8f0fe',            fg: '#174ea6',          label: 'Лік',        labelEn: 'Number' },
    [TokenType.PUNCT]:   { bg: 'color-mix(in srgb, var(--fg-muted) 30%, transparent)', fg: 'var(--fg-muted)', label: 'Пункт', labelEn: 'Punct' },
    [TokenType.SPACE]:   { bg: 'transparent',        fg: 'transparent',      label: 'Прабел',     labelEn: 'Space' },
    [TokenType.NEWLINE]: { bg: '#e8eaed',             fg: 'var(--fg-muted)',  label: '↵',          labelEn: '↵' },
    [TokenType.EMAIL]:   { bg: '#fce8e6',             fg: '#c5221f',          label: 'Email',      labelEn: 'Email' },
    [TokenType.LINK]:    { bg: '#e8f5e9',             fg: '#1e7e34',          label: 'URL',        labelEn: 'URL' },
    [TokenType.HASHTAG]: { bg: '#fef7e0',             fg: '#e37400',          label: 'Хэштэг',    labelEn: 'Hashtag' },
    [TokenType.MENTION]: { bg: '#f3e8fd',             fg: '#7b1fa2',          label: 'Згадка',    labelEn: 'Mention' },
    [TokenType.OTHER]:   { bg: 'var(--border)',       fg: 'var(--fg-muted)',  label: 'Іншае',     labelEn: 'Other' },
  };

  let text = $state("");
  let tokens = $derived(Tokenizer.tokenize(text));
  let typeCounts = $derived(countTypes(tokens));

  // When morph is available, analyze each word token
  let analyzed = $derived(
    morph
      ? new TextAnalyzer(morph).analyze(text)
      : tokens.map(t => ({ token: t, parse: null }))
  );
  let wordCount = $derived(analyzed.filter(a => a.parse !== null).length);

  function countTypes(tokens: Token[]): Map<TT, number> {
    const m = new Map<TT, number>();
    for (const t of tokens) m.set(t.type as TT, (m.get(t.type as TT) ?? 0) + 1);
    return m;
  }

  function typeLabel(type: TT): string {
    return appState.lang === 'be' ? (COLOR_MAP[type]?.label ?? type) : (COLOR_MAP[type]?.labelEn ?? type);
  }

  function posLabel(pos: string | undefined): string {
    if (!pos) return '';
    if (appState.lang === 'be') return POS[pos] ?? pos;
    return POS_EN[pos] ?? pos;
  }

  function selectExample(ex: string) {
    text = ex;
  }
</script>

<div class="tokenizer-section">
  <textarea
    class="tokenizer-input"
    placeholder={ui.tokenizerPlaceholder}
    bind:value={text}
    rows="4"
  ></textarea>

  <p class="tokenizer-hint">{morph ? ui.tokenizerHintMorph : ui.tokenizerHint}</p>

  <div class="tokenizer-examples">
    <span class="examples-label">{ui.tokenizerExamples}</span>
    {#each ui.tokenizerExampleTexts as ex}
      <button class="example-chip" onclick={() => selectExample(ex)}>
        {ex.slice(0, 35)}{ex.length > 35 ? '…' : ''}
      </button>
    {/each}
  </div>

  {#if tokens.length > 0}
    <div class="token-stats">
      <span class="stat-badge">{tokens.length} {ui.tokensFound}</span>
      <span class="stat-badge">{typeCounts.size} {ui.tokenTypes}</span>
      {#if morph && wordCount > 0}
        <span class="stat-badge stat-badge-morph">{wordCount} {ui.wordsParsed}</span>
      {/if}
    </div>

    <div class="token-display">
      {#each analyzed as { token, parse }}
        {@const colors = COLOR_MAP[token.type] ?? COLOR_MAP[TokenType.OTHER]}
        <span
          class="token-chip"
          class:token-has-parse={parse !== null}
          style="background: {colors.bg}; color: {colors.fg};"
          title={parse
            ? `${typeLabel(token.type as TT)}: «${token.toString()}» → лема «${parse.lemma}» (${posLabel(parse.tags.pos)})`
            : `${typeLabel(token.type as TT)}: «${token.toString()}»`}
        >
          {#if token.type === TokenType.NEWLINE}
            <span class="token-nl-mark">↵</span>
          {:else if token.type === TokenType.SPACE}
            <span class="token-space-mark">{token.toString().replace(/ /g, '·')}</span>
          {:else}
            {token.toString()}
          {/if}
          <span class="token-type-badge">{typeLabel(token.type as TT)}</span>
          {#if parse}
            <span class="token-morph-info">{parse.lemma} <span class="token-morph-pos">({posLabel(parse.tags.pos)})</span></span>
          {/if}
        </span>
      {/each}
    </div>

    <details class="token-legend">
      <summary class="legend-toggle">{appState.lang === 'be' ? 'Легенда' : 'Legend'}</summary>
      <div class="legend-grid">
        {#each [...typeCounts.entries()] as [type, count]}
          {@const colors = COLOR_MAP[type] ?? COLOR_MAP[TokenType.OTHER]}
          <div class="legend-item">
            <span class="legend-swatch" style="background: {colors.bg}; color: {colors.fg}; border: 1px solid {colors.fg}20;">
              {typeLabel(type)}
            </span>
            <span class="legend-count">{count}</span>
          </div>
        {/each}
      </div>
    </details>
  {/if}
</div>
