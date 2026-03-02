<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import ResultCard from './ResultCard.svelte';

  let { results, searched }: { results: ParseResult[]; searched: boolean } = $props();

  let activeIdx = $state(0);

  $effect(() => {
    // Reset tab when results change
    results;
    activeIdx = 0;
  });
</script>

{#if searched && results.length === 0}
  <div class="empty-state">Слова не знойдзена ў слоўніку</div>
{:else if results.length > 0}
  {#if results.length > 1}
    <div class="tabs" role="tablist">
      {#each results as _, i}
        <button
          class="tab-btn"
          class:active={activeIdx === i}
          role="tab"
          aria-selected={activeIdx === i}
          onclick={() => (activeIdx = i)}
        >
          Значэнне {i + 1}
        </button>
      {/each}
    </div>
  {/if}

  <ResultCard result={results[activeIdx]} />
{/if}
