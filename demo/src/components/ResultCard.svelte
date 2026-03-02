<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import { POS, CASE, NUMBER, GENDER, PERSON, TENSE, MOOD, ANIMACY, ASPECT, VOICE, COMPARISON } from '../lib/i18n.js';
  import InflectionPanel from './InflectionPanel.svelte';
  import LexemeTable from './LexemeTable.svelte';

  let { result }: { result: ParseResult } = $props();

  function tagPills(tags: ParseResult['tags']) {
    const pills: string[] = [];
    if (tags.animacy) pills.push(ANIMACY[tags.animacy] ?? tags.animacy);
    if (tags.aspect) pills.push(ASPECT[tags.aspect] ?? tags.aspect);
    if (tags.voice) pills.push(VOICE[tags.voice] ?? tags.voice);
    if (tags.comparison) pills.push(COMPARISON[tags.comparison] ?? tags.comparison);
    if (tags.mood) pills.push(MOOD[tags.mood] ?? tags.mood);
    if (tags.tense) pills.push(TENSE[tags.tense] ?? tags.tense);
    if (tags.person) pills.push(PERSON[tags.person] ?? tags.person);
    if (tags.gender) pills.push(GENDER[tags.gender] ?? tags.gender);
    if (tags.number) pills.push(NUMBER[tags.number] ?? tags.number);
    if (tags.case) pills.push(CASE[tags.case] ?? tags.case);
    return pills;
  }

  let pills = $derived(tagPills(result.tags));
  let posLabel = $derived(result.tags.pos ? (POS[result.tags.pos] ?? result.tags.pos) : '');
</script>

<div class="card">
  <div class="word-heading">
    <span class="word-form">{result.word}</span>
    {#if result.predicted}
      <span class="predicted-badge">(прадказана)</span>
    {/if}
  </div>

  <div class="tags-row">
    {#if posLabel}
      <span class="pill pill-pos">{posLabel}</span>
    {/if}
    {#each pills as pill}
      <span class="pill pill-gray">{pill}</span>
    {/each}
  </div>

  {#if result.lemma !== result.word}
    <div class="lemma-row">форма слова <span>{result.lemma}</span></div>
  {/if}

  <InflectionPanel {result} />

  <LexemeTable {result} />
</div>
