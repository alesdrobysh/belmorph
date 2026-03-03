<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import { appState } from '../lib/lang.svelte.js';
  import { LABELS, UI } from '../lib/i18n.js';
  import { cap } from '../lib/utils.js';

  const i18n = $derived(LABELS[appState.lang]);
  const ui = $derived(UI[appState.lang]);
  import InflectionPanel from './InflectionPanel.svelte';
  import LexemeTable from './LexemeTable.svelte';

  let { result }: { result: ParseResult } = $props();

  type TagEntry = { label: string; value: string };

  function buildTags(tags: ParseResult['tags']): TagEntry[] {
    const t: TagEntry[] = [];
    if (tags.pos)        t.push({ label: ui.posLabel,      value: cap(i18n.POS[tags.pos] ?? tags.pos) });
    if (tags.case)       t.push({ label: ui.case,          value: i18n.CASE[tags.case] ?? tags.case });
    if (tags.number)     t.push({ label: ui.number,        value: i18n.NUMBER[tags.number] ?? tags.number });
    if (tags.gender)     t.push({ label: ui.gender,        value: cap(i18n.GENDER[tags.gender] ?? tags.gender) });
    if (tags.animacy)    t.push({ label: ui.animacyLabel,  value: i18n.ANIMACY[tags.animacy] ?? tags.animacy });
    if (tags.tense)      t.push({ label: ui.tense,         value: i18n.TENSE[tags.tense] ?? tags.tense });
    if (tags.person)     t.push({ label: ui.person,        value: i18n.PERSON[tags.person] ?? tags.person });
    if (tags.aspect)     t.push({ label: ui.aspectLabel,   value: cap(i18n.ASPECT[tags.aspect] ?? tags.aspect) });
    if (tags.voice)      t.push({ label: ui.voice,         value: cap(i18n.VOICE[tags.voice] ?? tags.voice) });
    if (tags.mood)       t.push({ label: ui.moodLabel,     value: cap(i18n.MOOD[tags.mood] ?? tags.mood) });
    if (tags.comparison) t.push({ label: ui.comparison,    value: cap(i18n.COMPARISON[tags.comparison] ?? tags.comparison) });
    return t;
  }

  const tags = $derived(buildTags(result.tags));
</script>

<div class="card">
  <div class="word-heading">
    <span class="word-form">{result.word}</span>
    {#if result.predicted}
      <span class="predicted-badge">({ui.predicted})</span>
    {/if}
  </div>

  <div class="lemma-line">
    <span class="tag-label">{ui.lema}:&nbsp;</span><span class="lemma-value">{result.lemma}</span>
  </div>

  <div class="tags-row">
    {#each tags as tag}
      <span class="tag-pill">
        <span class="tag-label">{tag.label}</span>
        <span class="tag-value">{tag.value}</span>
      </span>
    {/each}
  </div>

  <InflectionPanel {result} />

  <LexemeTable {result} />
</div>
