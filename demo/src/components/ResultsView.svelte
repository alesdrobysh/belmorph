<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import { appState } from '../lib/lang.svelte.js';
  import { UI } from '../lib/i18n.js';
  import ResultCard from './ResultCard.svelte';

  const ui = $derived(UI[appState.lang]);

  let { results, searched }: { results: ParseResult[]; searched: boolean } = $props();

  const interpText = $derived(
    results.length === 1
      ? `1 ${ui.interp1}`
      : `${results.length} ${ui.interp2}`
  );
</script>

{#if searched && results.length === 0}
  <div class="empty-state">{ui.notFound}</div>
{:else if results.length > 0}
  <div class="interp-count">{interpText}</div>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    {#each results as result}
      <ResultCard {result} />
    {/each}
  </div>
{/if}
